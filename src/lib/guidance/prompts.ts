/**
 * AI Guidance Prompts
 *
 * The AI acts as a senior developer who understands user needs
 * and automatically determines the right technical implementation.
 */

import type { ArtifactBase, Field, FieldType, ToolType } from "@/types/artifact";
import type { GuidancePhase } from "@/types/guidance";

/**
 * System prompt - AI acts as a senior developer
 */
export const GUIDANCE_SYSTEM_PROMPT = `Tu es un developpeur senior React/TypeScript avec 10 ans d'experience. Tu aides les utilisateurs a creer des outils web en comprenant VRAIMENT leur besoin.

## TA MISSION

Tu dois COMPRENDRE ce que l'utilisateur veut creer et DETERMINER automatiquement:
1. Le TYPE d'outil (convertisseur, calculateur, tracker, generateur, etc.)
2. L'INTERFACE appropriee (file upload, formulaires, tableaux, etc.)
3. Les FONCTIONNALITES necessaires
4. Le DESIGN et l'UX optimaux

## TYPES D'OUTILS QUE TU SAIS CREER

### CONVERTISSEUR (converter)
Ex: "PDF vers PNG", "CSV vers JSON", "Image resizer"
→ Interface: Zone de drop/upload, preview, bouton convertir, download
→ Champs: fichier source (type: file), format cible (type: select)

### CALCULATEUR (calculator)
Ex: "Calculateur IMC", "Simulateur de pret", "Convertisseur de devises"
→ Interface: Champs de saisie numerique, resultat en temps reel, formules
→ Champs: nombres, pourcentages, devises (types: number, currency, range)

### TRACKER / GESTIONNAIRE (tracker)
Ex: "Suivi des depenses", "Todo list", "CRM simple"
→ Interface: Formulaire d'ajout, liste/tableau, filtres, stats
→ Champs: selon le domaine (text, date, select, number, etc.)

### GENERATEUR (generator)
Ex: "Generateur de mots de passe", "Lorem ipsum", "QR codes"
→ Interface: Options de configuration, bouton generer, copier/telecharger
→ Champs: options (select, checkbox, range)

### DASHBOARD (dashboard)
Ex: "Tableau de bord ventes", "Analytics"
→ Interface: Cartes metriques, graphiques, tableaux
→ Champs: donnees sources

### RECHERCHE (search)
Ex: "Annuaire", "Recherche de recettes"
→ Interface: Barre de recherche, filtres, resultats, pagination
→ Champs: criteres de recherche

### EDITEUR (editor)
Ex: "Editeur Markdown", "Retouche photo simple"
→ Interface: Zone d'edition, toolbar, preview
→ Champs: contenu editable

### FORMULAIRE (form)
Ex: "Inscription evenement", "Enquete satisfaction"
→ Interface: Formulaire multi-etapes ou simple, validation, confirmation
→ Champs: selon le besoin (text, email, phone, textarea, select, checkbox)

## TYPES DE CHAMPS DISPONIBLES

Tu peux utiliser ces types dans les champs:
- text: Texte court
- textarea: Texte long multi-lignes
- number: Nombre
- currency: Montant avec devise (€)
- date: Date
- email: Email avec validation
- phone: Telephone
- url: Lien URL
- select: Liste deroulante (necessite options)
- checkbox: Case a cocher
- file: Upload de fichier (necessite accept: ".pdf,.doc")
- image: Upload image avec preview
- color: Selecteur couleur
- range: Curseur/slider

## COMMENT TU REFLECHIS

Quand l'utilisateur dit "Je veux un convertisseur PDF vers PNG":

1. TYPE: C'est un CONVERTISSEUR de fichiers
2. INTERFACE: Il faut une zone de drop pour PDF, un bouton convertir, et un download PNG
3. ENTITE: "Conversion" avec champs:
   - fichier_pdf (type: file, accept: ".pdf")
   - format_sortie (type: select, options: ["PNG", "JPG", "WEBP"])
4. PAS BESOIN de demander "quels champs veux-tu?" - TU SAIS deja ce qu'il faut!

Quand l'utilisateur dit "Un calculateur de pret":

1. TYPE: C'est un CALCULATEUR financier
2. INTERFACE: Champs numeriques, calcul temps reel, tableau d'amortissement
3. ENTITE: "Pret" avec champs:
   - montant (type: currency)
   - taux (type: number, unite: %)
   - duree (type: number, unite: mois)
4. REGLES: Calculer mensualite, cout total, tableau amortissement

## REGLES DE CONVERSATION

1. **Premiere reponse**: Montre que tu as COMPRIS en proposant directement une structure
2. **Questions intelligentes**: Pose des questions sur l'UX/fonctionnalites, PAS sur les champs techniques
3. **Maximum 3 echanges** avant de proposer la confirmation
4. **Sois proactif**: Propose des fonctionnalites auxquelles l'utilisateur n'a pas pense

## EXEMPLES DE BONNES REPONSES

Utilisateur: "Un convertisseur PDF vers PNG"

TOI: "Parfait ! Je vais creer un convertisseur PDF → PNG avec:
- Zone de drop/upload pour le PDF
- Preview du document
- Bouton de conversion
- Telechargement des images PNG

Une question: tu veux convertir toutes les pages ou pouvoir choisir lesquelles?"

Utilisateur: "Un suivi de mes depenses"

TOI: "Super, je te prepare un tracker de depenses avec:
- Ajout rapide: montant, categorie, date, note
- Vue liste avec filtres par periode/categorie
- Dashboard avec total mensuel et graphique par categorie
- Sauvegarde locale automatique

Tu veux des categories predefinies (Courses, Transport, Loisirs...) ou les creer toi-meme?"

## FORMAT DE REPONSE JSON

{
  "message": "Ta reponse conversationnelle",
  "question": {
    "type": "single|multi|confirm",
    "options": [{"label": "Option", "description": "..."}],
    "allowCustom": true
  },
  "artifactUpdate": {
    "toolName": "Nom de l'outil",
    "toolType": "converter|calculator|tracker|generator|dashboard|search|editor|form|custom",
    "entities": [{
      "name": "EntitePrincipale",
      "fields": [
        {"name": "champ1", "type": "file", "accept": ".pdf"},
        {"name": "champ2", "type": "select", "options": ["A", "B"]}
      ]
    }],
    "rules": [{"condition": "...", "action": "..."}]
  },
  "contextUpdate": {
    "domain": "...",
    "confidence": 0.9,
    "complexity": "simple|medium|complex"
  },
  "nextPhase": "discovering|refining|confirming|complete",
  "readyToConfirm": false
}

IMPORTANT:
- Reponds TOUJOURS en JSON valide
- Le champ "message" est OBLIGATOIRE
- Inclus TOUJOURS un artifactUpdate avec toolType des la premiere reponse
- Sois CONCIS mais COMPLET dans tes propositions`;

/**
 * Build the user message context for AI
 */
export function buildGuidanceContext(params: {
  currentMessage: string;
  selectedOptions?: string[];
  currentArtifact: Partial<ArtifactBase>;
  currentPhase: GuidancePhase;
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>;
}): string {
  const { currentMessage, selectedOptions, currentArtifact, currentPhase, messageHistory } = params;

  // Build conversation history summary (last 6 messages max)
  const recentHistory = messageHistory.slice(-6);
  const historyText = recentHistory.length > 0
    ? recentHistory.map(m => `${m.role === "user" ? "USER" : "DEV"}: ${m.content}`).join("\n")
    : "(Debut de conversation)";

  // Build current artifact summary
  const artifactSummary = buildArtifactSummary(currentArtifact);

  return `## CONTEXTE

Phase: ${currentPhase}
${recentHistory.length > 0 ? `\nHistorique:\n${historyText}` : ""}

Artifact actuel:
${artifactSummary}

## INPUT UTILISATEUR

${selectedOptions && selectedOptions.length > 0
    ? `Selections: ${selectedOptions.join(", ")}\nMessage: ${currentMessage || "(aucun)"}`
    : `Message: ${currentMessage}`
}

## INSTRUCTIONS

Analyse le besoin et reponds en JSON. Si c'est la premiere fois, propose directement une structure complete basee sur ce que tu comprends du besoin.`;
}

/**
 * Build a human-readable summary of the current artifact
 */
function buildArtifactSummary(artifact: Partial<ArtifactBase>): string {
  if (!artifact || Object.keys(artifact).length === 0) {
    return "(Vide - premiere interaction)";
  }

  const parts: string[] = [];

  if (artifact.toolName) {
    parts.push(`Nom: ${artifact.toolName}`);
  }

  if (artifact.toolType) {
    parts.push(`Type: ${artifact.toolType}`);
  }

  if (artifact.customDescription) {
    parts.push(`Description: ${artifact.customDescription}`);
  }

  if (artifact.entities && artifact.entities.length > 0) {
    const entitiesSummary = artifact.entities.map(e => {
      const fields = e.fields?.map(f => `${f.name}(${f.type})`).join(", ") || "aucun";
      return `- ${e.name}: ${fields}`;
    }).join("\n");
    parts.push(`Entites:\n${entitiesSummary}`);
  }

  if (artifact.rules && artifact.rules.length > 0) {
    parts.push(`Regles: ${artifact.rules.length}`);
  }

  return parts.length > 0 ? parts.join("\n") : "(Structure vide)";
}

/**
 * Initial welcome message when user has NOT provided a description yet
 */
export const WELCOME_MESSAGE_EMPTY = {
  message: "Salut ! Decris-moi l'outil que tu veux creer. Ca peut etre n'importe quoi: un convertisseur, un calculateur, un tracker, un generateur...",
  nextPhase: "welcome" as const,
};

/**
 * Build initial message when user already provided a description
 */
export function buildInitialMessageForDescription(description: string): string {
  return `L'utilisateur veut: "${description}"

ANALYSE ce besoin comme un dev senior:
1. Determine le TYPE d'outil (converter, calculator, tracker, etc.)
2. Identifie les ENTITES et CHAMPS necessaires (avec les bons types: file, currency, etc.)
3. Propose une structure COMPLETE immediatement
4. Pose UNE question pertinente sur l'UX ou les fonctionnalites (pas sur les champs!)

Reponds en JSON avec un artifactUpdate COMPLET incluant toolType et entities.`;
}

/**
 * Parse AI response and extract structured data
 */
export function parseGuidanceResponse(rawResponse: string): {
  success: boolean;
  data?: {
    message: string;
    question?: {
      type: "single" | "multi" | "confirm";
      text?: string;
      options: Array<{ label: string; description?: string }>;
      allowCustom: boolean;
    };
    artifactUpdate?: {
      toolName?: string;
      toolType?: ToolType;
      entities?: Array<{
        name: string;
        fields?: Array<{
          name: string;
          type: FieldType;
          accept?: string;
          options?: string[];
          placeholder?: string;
          required?: boolean;
        }>;
      }>;
      rules?: Array<{ condition: string; action: string }>;
    };
    contextUpdate?: {
      domain: string;
      confidence: number;
      suggestedPatterns?: string[];
      complexity: "simple" | "medium" | "complex";
    };
    nextPhase?: GuidancePhase;
    readyToConfirm?: boolean;
  };
  error?: string;
} {
  try {
    // Try to extract JSON from response (might be wrapped in markdown code blocks)
    let jsonStr = rawResponse.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Validate required field
    if (!parsed.message || typeof parsed.message !== "string") {
      return { success: false, error: "Response missing required 'message' field" };
    }

    return { success: true, data: parsed };
  } catch (e) {
    // If JSON parsing fails, try to extract just a message
    const messageMatch = rawResponse.match(/"message"\s*:\s*"([^"]+)"/);
    if (messageMatch) {
      return {
        success: true,
        data: { message: messageMatch[1] },
      };
    }

    return {
      success: false,
      error: `Failed to parse AI response: ${e instanceof Error ? e.message : "Unknown error"}`,
    };
  }
}

/**
 * Merge artifact updates into existing artifact
 */
export function mergeArtifactUpdate(
  current: Partial<ArtifactBase>,
  update?: {
    toolName?: string;
    toolType?: ToolType;
    entities?: Array<{
      name: string;
      fields?: Array<{ name: string; type: FieldType; accept?: string; options?: string[]; placeholder?: string; required?: boolean }>;
    }>;
    rules?: Array<{ condition: string; action: string }>;
  }
): Partial<ArtifactBase> {
  if (!update) return current;

  const merged = { ...current };

  if (update.toolName) {
    merged.toolName = update.toolName;
  }

  if (update.toolType) {
    merged.toolType = update.toolType;
  }

  if (update.entities) {
    // Merge entities - update existing by name, add new ones
    const existingEntities = merged.entities || [];
    const entityMap = new Map(existingEntities.map(e => [e.name.toLowerCase(), e]));

    for (const newEntity of update.entities) {
      const key = newEntity.name.toLowerCase();
      const existing = entityMap.get(key);

      if (existing) {
        // Update existing entity - merge fields
        const existingFields = existing.fields || [];
        const newFields = newEntity.fields || [];
        const fieldSet = new Set(existingFields.map(f => f.name.toLowerCase()));

        for (const field of newFields) {
          if (!fieldSet.has(field.name.toLowerCase())) {
            existingFields.push(field);
          }
        }
        existing.fields = existingFields;
      } else {
        // Add new entity
        entityMap.set(key, {
          name: newEntity.name,
          fields: newEntity.fields || [],
        });
      }
    }

    merged.entities = Array.from(entityMap.values());
  }

  if (update.rules) {
    // Append new rules, avoiding duplicates
    const existingRules = merged.rules || [];
    const ruleSet = new Set(existingRules.map(r => `${r.condition}|${r.action}`));

    for (const rule of update.rules) {
      const key = `${rule.condition}|${rule.action}`;
      if (!ruleSet.has(key)) {
        existingRules.push(rule);
        ruleSet.add(key);
      }
    }

    merged.rules = existingRules;
  }

  return merged;
}
