"use client";

import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <JotaiProvider>
        {children}
        <Toaster richColors position="bottom-right" />
      </JotaiProvider>
    </ThemeProvider>
  );
}
