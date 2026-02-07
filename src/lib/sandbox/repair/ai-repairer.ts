/**
 * AI Repairer
 *
 * Uses Claude AI to repair complex code errors that can't be auto-fixed.
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { AIRepairResult, ClassifiedError } from "@/types/sandbox";
import type { BaseSandboxProvider } from "../providers/base";

/**
 * System prompt for AI repair
 */
const REPAIR_SYSTEM_PROMPT = `Tu es un expert en correction de code React/JSX. Tu recois du code avec des erreurs et tu dois le corriger.

REGLES STRICTES:
1. Retourne UNIQUEMENT le code corrige, sans explication
2. Ne change pas la logique metier, corrige seulement les erreurs
3. Garde le meme style de code
4. N'ajoute pas de commentaires
5. Le code doit etre une fonction React valide exportee par defaut
6. Utilise Tailwind CSS pour le style (pas de CSS externe)
7. Le code doit etre autonome (pas d'imports externes sauf React hooks)

FORMAT DE SORTIE:
- Retourne le code JSX complet
- Commence par les imports necessaires
- Termine par export default App (ou le nom du composant)`;

/**
 * Repair code using AI
 */
export async function repairWithAI(
  code: string,
  errors: ClassifiedError[],
  maxOutputTokens: number = 4096
): Promise<AIRepairResult> {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const errorMessages = errors
    .map((e) => `- ${e.type}: ${e.message}`)
    .join("\n");

  const userPrompt = `Corrige les erreurs suivantes dans ce code React:

ERREURS:
${errorMessages}

CODE A CORRIGER:
\`\`\`jsx
${code}
\`\`\`

Retourne le code corrige (code uniquement, pas d'explication):`;

  try {
    console.log("[AIRepairer] Requesting AI repair...");

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: REPAIR_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: maxOutputTokens,
    });

    // Extract code from response
    let repairedCode = result.text;

    // Remove markdown code blocks if present
    repairedCode = repairedCode
      .replace(/^```(?:jsx?|typescript|tsx)?\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    console.log(
      `[AIRepairer] Repair completed, tokens used: ${result.usage.totalTokens}`
    );

    return {
      success: true,
      repairedCode,
      explanation: "Code repare par Claude AI",
      tokensUsed: result.usage?.totalTokens ?? 0,
    };
  } catch (error) {
    console.error("[AIRepairer] AI repair failed:", error);
    return {
      success: false,
      repairedCode: code,
      explanation:
        error instanceof Error ? error.message : "AI repair failed",
      tokensUsed: 0,
    };
  }
}

/**
 * Apply AI repair to sandbox
 */
export async function applyAIRepair(
  provider: BaseSandboxProvider,
  errors: ClassifiedError[]
): Promise<AIRepairResult> {
  try {
    // Read current code
    const currentCode = await provider.readFile("src/App.jsx");

    // Get AI repair
    const result = await repairWithAI(currentCode, errors);

    if (result.success) {
      // Write repaired code
      await provider.writeFile("src/App.jsx", result.repairedCode);
      console.log("[AIRepairer] Repaired code applied to sandbox");
    }

    return result;
  } catch (error) {
    console.error("[AIRepairer] Failed to apply AI repair:", error);
    return {
      success: false,
      repairedCode: "",
      explanation: error instanceof Error ? error.message : "Failed to apply repair",
      tokensUsed: 0,
    };
  }
}

/**
 * Generate missing component using AI
 */
export async function generateMissingComponent(
  componentName: string,
  context: string
): Promise<string | null> {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Genere un composant React simple nomme "${componentName}" base sur ce contexte:
${context}

REGLES:
- Composant fonctionnel React
- Utilise Tailwind CSS
- Export par defaut
- Pas de props complexes
- Design moderne et clean

Retourne uniquement le code JSX:`;

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: REPAIR_SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 2048,
    });

    let code = result.text
      .replace(/^```(?:jsx?|typescript|tsx)?\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    return code;
  } catch (error) {
    console.error("[AIRepairer] Failed to generate component:", error);
    return null;
  }
}

/**
 * Simplify complex code that causes errors
 */
export async function simplifyCode(code: string): Promise<AIRepairResult> {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `Simplifie ce code React pour qu'il fonctionne sans erreur.
Garde la fonctionnalite principale mais enleve les parties complexes qui pourraient causer des erreurs.

CODE:
\`\`\`jsx
${code}
\`\`\`

Retourne le code simplifie:`;

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: REPAIR_SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 4096,
    });

    let simplifiedCode = result.text
      .replace(/^```(?:jsx?|typescript|tsx)?\n?/gm, "")
      .replace(/```$/gm, "")
      .trim();

    return {
      success: true,
      repairedCode: simplifiedCode,
      explanation: "Code simplifie par Claude AI",
      tokensUsed: result.usage?.totalTokens ?? 0,
    };
  } catch (error) {
    return {
      success: false,
      repairedCode: code,
      explanation: error instanceof Error ? error.message : "Simplification failed",
      tokensUsed: 0,
    };
  }
}

/**
 * Check if AI repair is available
 */
export function isAIRepairAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
