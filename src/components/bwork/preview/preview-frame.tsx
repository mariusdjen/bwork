"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type PreviewFrameProps = {
  generatedCode: string | null;
};

/**
 * Renders generated tool code inside a sandboxed iframe using srcdoc.
 * The iframe is isolated: no parent DOM access, no navigation, no popups.
 * React 18 + Tailwind CSS + Babel standalone are loaded via CDN inside the iframe.
 * Errors inside the iframe are communicated back via postMessage.
 */
export function PreviewFrame({ generatedCode }: PreviewFrameProps) {
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

  if (!generatedCode) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 md:h-[400px] lg:h-[500px]">
        <p className="text-sm text-muted-foreground">
          Aucun code genere pour cet outil.
        </p>
      </div>
    );
  }

  const srcdoc = buildSrcdoc(generatedCode);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border">
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
        sandbox="allow-scripts allow-forms"
        referrerPolicy="no-referrer"
        title="Preview de l'outil"
        className="h-[300px] w-full border-0 md:h-[400px] lg:h-[500px]"
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
