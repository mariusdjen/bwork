import { ThemeProvider } from "next-themes";

/**
 * Minimal layout for deployed tools (/t/[slug]).
 * No sidebar, no header, no B-WORK branding — just the tool content.
 */
export default function DeployedToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">{children}</div>
    </ThemeProvider>
  );
}
