"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type PreviewFrameProps = {
  generatedCode: string | null;
  fullscreen?: boolean;
};

/**
 * Renders generated tool code inside a sandboxed iframe using srcdoc.
 * The iframe shares the parent origin (allow-same-origin) to enable API proxy calls.
 * React 18 + Tailwind CSS + Babel standalone are loaded via CDN inside the iframe.
 * External fetch calls are intercepted and routed through /api/tools/proxy.
 * Errors inside the iframe are communicated back via postMessage.
 */
export function PreviewFrame({ generatedCode, fullscreen = false }: PreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingResolvedRef = useRef(false);

  // Listen for error messages from the iframe, verifying source origin
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // H1 fix: only accept messages from our own iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "bwork-preview-error"
      ) {
        setIframeError(event.data.message ?? "Erreur inconnue dans le rendu.");
        setIsLoading(false);
        loadingResolvedRef.current = true;
      }
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "bwork-preview-ready"
      ) {
        setIframeError(null);
        setIsLoading(false);
        loadingResolvedRef.current = true;
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const containerHeight = fullscreen
    ? "h-full"
    : "h-[400px] md:h-[500px] lg:h-[600px]";

  if (!generatedCode) {
    return (
      <div className={`flex ${containerHeight} w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50`}>
        <p className="text-sm text-muted-foreground">
          Aucun code genere pour cet outil.
        </p>
      </div>
    );
  }

  const srcdoc = buildSrcdoc(generatedCode);

  return (
    <div className={`relative w-full overflow-hidden ${fullscreen ? "" : "rounded-lg border border-border"}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      )}
      {iframeError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 px-6 text-center">
          <p className="text-base font-semibold text-destructive">
            Impossible d&apos;afficher l&apos;outil
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {iframeError}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Modifiez votre artefact et regenerez.
          </p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox="allow-scripts allow-forms allow-same-origin"
        referrerPolicy="no-referrer"
        title="Preview de l'outil"
        className={`w-full border-0 ${containerHeight}`}
        onLoad={() => {
          // Fallback: if postMessage hasn't resolved loading yet, stop after 3s
          setTimeout(() => {
            if (!loadingResolvedRef.current) {
              setIsLoading(false);
              loadingResolvedRef.current = true;
            }
          }, 3000);
        }}
      />
    </div>
  );
}

/**
 * Cleans AI-generated code for safe iframe execution.
 * Handles various patterns AI models produce despite prompt instructions.
 */
function cleanGeneratedCode(raw: string): string {
  let code = raw.trim();

  // Remove markdown code fences (```jsx, ```tsx, ```javascript, etc.)
  code = code.replace(/^```[\w\s]*\n?/gm, "");
  code = code.replace(/\n?```$/gm, "");

  // Remove import statements — strict single-line only to avoid destroying code
  code = code.replace(/^\s*import\s+(?:[\w{},*\s]+)\s+from\s+['"][^'"]*['"];?\s*$/gm, "");
  code = code.replace(/^\s*import\s+['"][^'"]*['"];?\s*$/gm, "");

  // Remove export default / export (preserve the declaration after it)
  code = code.replace(/^\s*export\s+default\s+/gm, "");
  code = code.replace(/^\s*export\s+(?=(?:function|const|let|var|class)\s)/gm, "");

  // Escape </script sequences to prevent breaking out of the script block
  code = code.replace(/<\/script/gi, "<\\/script");

  return code.trim();
}

/**
 * Builds a complete HTML document for the iframe srcdoc.
 * Includes React 18 UMD via CDN, Tailwind CSS via CDN, and Babel standalone
 * for JSX transpilation. The generated code is expected to define a
 * function App() component using JSX syntax.
 */
function buildSrcdoc(generatedCode: string): string {
  const code = cleanGeneratedCode(generatedCode);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    #bwork-error { display: none; padding: 2rem; text-align: center; color: #dc2626; }
  </style>
</head>
<body class="bg-white text-gray-900">
  <div id="root"></div>
  <div id="bwork-error">
    <p style="font-size:1.125rem;font-weight:600;">Impossible d'afficher l'outil</p>
    <p id="bwork-error-detail" style="font-size:0.875rem;color:#6b7280;margin-top:0.5rem;"></p>
  </div>
  <script>
    // Override fetch to route external API calls through the server proxy.
    // This bypasses CORS restrictions for generated tools that call third-party APIs.
    (function() {
      var originalFetch = window.fetch;
      window.fetch = function(input, init) {
        var url = typeof input === "string" ? input : (input instanceof Request ? input.url : String(input));
        // Only proxy absolute http(s) URLs to external domains
        try {
          var parsed = new URL(url, window.location.origin);
          if ((parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.origin !== window.location.origin) {
            var method = (init && init.method) || "GET";
            var headers = {};
            if (init && init.headers) {
              if (init.headers instanceof Headers) {
                init.headers.forEach(function(v, k) { headers[k] = v; });
              } else if (typeof init.headers === "object") {
                headers = Object.assign({}, init.headers);
              }
            }
            var body = undefined;
            if (init && init.body) {
              if (typeof init.body === "string") { body = init.body; }
              else if (init.body instanceof URLSearchParams) { body = init.body.toString(); }
              else if (init.body instanceof FormData) {
                var obj = {}; init.body.forEach(function(v, k) { obj[k] = v; });
                body = JSON.stringify(obj);
              }
              else { try { body = JSON.stringify(init.body); } catch(e) { body = String(init.body); } }
            }
            return originalFetch("/api/tools/proxy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: url, method: method, headers: headers, body: body })
            });
          }
        } catch(e) {}
        return originalFetch(input, init);
      };
    })();

    // Global error handler — catches Babel transpilation errors and runtime errors
    window.onerror = function(msg, src, line, col, err) {
      var detail = (err && err.message) || String(msg);
      document.getElementById("root").style.display = "none";
      var errorDiv = document.getElementById("bwork-error");
      errorDiv.style.display = "block";
      document.getElementById("bwork-error-detail").textContent = detail;
      try { parent.postMessage({ type: "bwork-preview-error", message: detail }, "*"); } catch(e) {}
    };
  <\/script>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo, useReducer, createElement, createContext, useContext } = React;

    ${code}

    try {
      const rootEl = document.getElementById("root");
      const root = ReactDOM.createRoot(rootEl);
      // Try common component names the AI might use
      const AppComponent =
        typeof App !== "undefined" ? App :
        typeof Main !== "undefined" ? Main :
        typeof Application !== "undefined" ? Application :
        null;

      if (!AppComponent) {
        throw new Error("Composant App() non trouve dans le code genere.");
      }
      root.render(<AppComponent />);
      // Notify parent that rendering succeeded
      try { parent.postMessage({ type: "bwork-preview-ready" }, "*"); } catch(e) {}
    } catch (e) {
      console.error("[B-WORK:preview] Render error:", e);
      document.getElementById("root").style.display = "none";
      var errorDiv = document.getElementById("bwork-error");
      errorDiv.style.display = "block";
      document.getElementById("bwork-error-detail").textContent = e.message || "Erreur de rendu.";
      try { parent.postMessage({ type: "bwork-preview-error", message: e.message || "Erreur de rendu." }, "*"); } catch(ex) {}
    }
  <\/script>
</body>
</html>`;
}
