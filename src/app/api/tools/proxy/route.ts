import { createClient } from "@/lib/supabase/server";

const ALLOWED_PROTOCOLS = ["https:", "http:"];

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
];

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2MB
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per user

// In-memory rate limiter (resets on server restart — fine for this use case)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Validates that a hostname is not a private/internal address.
 * Checks against blocked hostnames and private IP ranges.
 */
function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOSTS.some((h) => hostname === h) || hostname.endsWith(".local")) {
    return true;
  }

  const ipMatch = hostname.match(/^(\d+)\.(\d+)\./);
  if (ipMatch) {
    const first = parseInt(ipMatch[1], 10);
    const second = parseInt(ipMatch[2], 10);
    if (
      first === 10 ||
      first === 0 ||
      first === 127 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 169 && second === 254)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Authenticated fetch proxy for sandboxed iframe tool previews.
 * Routes external API calls through the server to bypass CORS restrictions.
 *
 * Security:
 * - Requires Supabase authentication
 * - Rate-limited per user (30 req/min)
 * - Blocks private/internal network access
 * - Blocks redirect-based SSRF (redirect: "manual")
 * - Limits response size to 2MB
 * - Strips sensitive headers
 */
export async function POST(request: Request) {
  // H1 fix: authenticate the request
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Non authentifie." }, { status: 401 });
  }

  // M2 fix: rate limiting
  if (isRateLimited(user.id)) {
    return Response.json(
      { error: "Trop de requetes. Reessayez dans une minute." },
      { status: 429 },
    );
  }

  let body: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Corps de requete invalide." },
      { status: 400 },
    );
  }

  const { url, method = "GET", headers: fwdHeaders = {}, body: fwdBody } = body;

  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL requise." }, { status: 400 });
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "URL invalide." }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return Response.json({ error: "Protocole non autorise." }, { status: 400 });
  }

  if (isBlockedHost(parsed.hostname)) {
    return Response.json({ error: "Hote non autorise." }, { status: 403 });
  }

  // Only allow safe methods
  const safeMethod = method.toUpperCase();
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(safeMethod)) {
    return Response.json({ error: "Methode non autorisee." }, { status: 400 });
  }

  // Strip sensitive headers
  const sanitizedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(fwdHeaders)) {
    const lower = key.toLowerCase();
    if (
      !["cookie", "authorization", "host", "origin", "referer"].includes(lower)
    ) {
      sanitizedHeaders[key] = value;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    // H2 fix: redirect: "manual" prevents SSRF via redirect to internal IPs
    const response = await fetch(url, {
      method: safeMethod,
      headers: sanitizedHeaders,
      body: safeMethod !== "GET" && fwdBody ? fwdBody : undefined,
      signal: controller.signal,
      redirect: "manual",
    });

    clearTimeout(timeout);

    // If the API responds with a redirect, block it (SSRF protection)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      // Allow redirect only if the target is also a safe external host
      if (location) {
        try {
          const redirectUrl = new URL(location, url);
          if (
            isBlockedHost(redirectUrl.hostname) ||
            !ALLOWED_PROTOCOLS.includes(redirectUrl.protocol)
          ) {
            return Response.json(
              { error: "Redirection vers un hote non autorise." },
              { status: 403 },
            );
          }
          // Follow one safe redirect manually
          const redirectResponse = await fetch(redirectUrl.toString(), {
            method: safeMethod,
            headers: sanitizedHeaders,
            body: safeMethod !== "GET" && fwdBody ? fwdBody : undefined,
            signal: controller.signal,
            redirect: "manual",
          });
          return buildProxyResponse(redirectResponse);
        } catch {
          return Response.json(
            { error: "Redirection invalide." },
            { status: 502 },
          );
        }
      }
      return Response.json(
        { error: "Redirection sans destination." },
        { status: 502 },
      );
    }

    return buildProxyResponse(response);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return Response.json(
        { error: "Timeout: l'API externe n'a pas repondu." },
        { status: 504 },
      );
    }
    return Response.json(
      { error: "Impossible de contacter l'API externe." },
      { status: 502 },
    );
  }
}

/**
 * Reads the upstream response and returns it to the client.
 * Enforces response size limit.
 */
async function buildProxyResponse(response: globalThis.Response) {
  // M1 fix: check content-length before reading body
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    return Response.json(
      { error: "Reponse trop volumineuse." },
      { status: 413 },
    );
  }

  // Read with size guard
  const reader = response.body?.getReader();
  if (!reader) {
    return Response.json(
      { error: "Reponse vide de l'API externe." },
      { status: 502 },
    );
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalSize += value.byteLength;
    if (totalSize > MAX_RESPONSE_SIZE) {
      reader.cancel();
      return Response.json(
        { error: "Reponse trop volumineuse." },
        { status: 413 },
      );
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const responseContentType =
    response.headers.get("content-type") ?? "application/json";

  return new Response(merged, {
    status: response.status,
    headers: {
      "Content-Type": responseContentType,
      "X-Proxy-Status": String(response.status),
    },
  });
}
