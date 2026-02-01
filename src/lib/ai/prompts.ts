import type { ArtifactBase } from "@/types/artifact";

const SYSTEM_PROMPT = `You are a senior React developer. You generate complete, functional single-file React components using JSX and Tailwind CSS.

CONSTRAINTS:
- Output ONLY the JSX/HTML code. No explanations, no markdown, no code fences.
- Use inline Tailwind CSS classes for all styling.
- Use React hooks (useState, useEffect) for state management.
- Do NOT import external libraries. Everything must be self-contained.
- Generate a complete tool with:
  1. A form to create/add entries based on the entity fields
  2. A list/table view to display all entries
  3. Business rules applied where specified
- Use French labels matching the entity and field names provided.
- Make the UI clean, professional, and accessible.
- Include form validation for required fields.
- Store data in React state (localStorage persistence is optional but recommended).
- Define your main component as: function App() { ... } — this exact function name is required.
- Do NOT use import/export statements. The code runs inline in a script tag with React available as a global.

EXTERNAL API ACCESS:
- You CAN use fetch() to call external APIs — it works. All external requests are automatically proxied through the server.
- When the tool requires live data (weather, exchange rates, news, etc.), USE real API calls with fetch().
- ALWAYS prefer FREE APIs that require NO API key. Here are recommended ones:
  * Weather: https://wttr.in/CITY?format=j1 (JSON, no key needed)
  * Exchange rates: https://open.er-api.com/v6/latest/USD (no key needed)
  * IP geolocation: https://ipapi.co/json/ (no key needed)
  * Random user data: https://randomuser.me/api/ (no key needed)
  * Placeholder data: https://jsonplaceholder.typicode.com/ (no key needed)
  * Countries info: https://restcountries.com/v3.1/ (no key needed)
  * Wikipedia: https://en.wikipedia.org/api/rest_v1/page/summary/TITLE (no key needed)
- If an API key is absolutely required, show a settings form in the UI where the user can paste their key, store it in React state, and use it in fetch calls.
- Handle loading states with a spinner or skeleton.
- Handle errors gracefully with user-friendly French messages.
- NEVER hardcode fake/placeholder data when real API data is available.`;

/**
 * Builds the generation prompt from the structured artifact.
 * Transforms entities, fields, and rules into a clear prompt for the AI.
 */
export function buildGenerationPrompt(artifact: ArtifactBase): string {
  const parts: string[] = [];

  parts.push(`Cree un outil web appele "${artifact.toolName}".`);

  if (artifact.customDescription) {
    parts.push(`Description : ${artifact.customDescription}`);
  }

  if (artifact.entities.length > 0) {
    parts.push("\n## Entites et champs\n");
    for (const entity of artifact.entities) {
      parts.push(`### ${entity.name}`);
      if (entity.fields.length > 0) {
        parts.push("Champs :");
        for (const field of entity.fields) {
          parts.push(`- **${field.name}** (type: ${field.type})`);
        }
      }
      parts.push("");
    }
  }

  if (artifact.rules.length > 0) {
    parts.push("\n## Regles metier\n");
    for (const rule of artifact.rules) {
      parts.push(`- Quand **${rule.condition}**, alors **${rule.action}**`);
    }
  }

  parts.push("\n## Exigences techniques\n");
  parts.push("- Genere un composant React complet avec formulaire de saisie et vue liste/tableau.");
  parts.push("- Utilise Tailwind CSS pour le style.");
  parts.push("- Le composant doit etre autonome (pas de dependances externes).");
  parts.push("- Les labels doivent etre en francais.");
  parts.push("- Inclut la validation des champs obligatoires.");
  parts.push("- Stocke les donnees dans le state React avec useState.");

  return parts.join("\n");
}

export { SYSTEM_PROMPT };
