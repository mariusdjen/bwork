import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Creates a signed access token for restricted tool access.
 * Uses HMAC-SHA256 with a server-side secret.
 */
export function createAccessToken(slug: string): string {
  const secret = getSigningSecret();
  const payload = `bwork-access:${slug}:${Date.now()}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verifies an access token is valid, properly signed, and not expired.
 */
export function verifyAccessToken(token: string, slug: string): boolean {
  const secret = getSigningSecret();
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  // Verify signature (timing-safe)
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;
  const sigBuffer = Buffer.from(signature, "hex");
  const expBuffer = Buffer.from(expected, "hex");
  if (sigBuffer.length !== expBuffer.length) return false;
  if (!timingSafeEqual(sigBuffer, expBuffer)) return false;

  // Verify payload is for this slug
  if (!payload.startsWith(`bwork-access:${slug}:`)) return false;

  // Verify token is not expired (server-side check)
  const parts = payload.split(":");
  const timestamp = Number(parts[parts.length - 1]);
  if (Number.isNaN(timestamp)) return false;
  if (Date.now() - timestamp > TOKEN_MAX_AGE_MS) return false;

  return true;
}

function getSigningSecret(): string {
  const secret =
    process.env.BWORK_ACCESS_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing BWORK_ACCESS_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  }
  return secret;
}
