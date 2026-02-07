import type { Json } from "@/types/database";
import { PreviewFrame } from "@/components/bwork/preview/preview-frame";

type ToolRendererProps = {
  tool: {
    id: string;
    name: string;
    description: string | null;
    artifact: Json | null;
    code_storage_path: string | null;
  };
};

/**
 * Renders a deployed tool using the sandboxed PreviewFrame.
 * Used on the public deployed page /t/[slug].
 */
export function ToolRenderer({ tool }: ToolRendererProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-4 text-center">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            B-WORK
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {tool.name}
          </h1>
          {tool.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.description}
            </p>
          )}
        </div>

        <PreviewFrame generatedCode={tool.code_storage_path} />
      </div>
    </div>
  );
}
