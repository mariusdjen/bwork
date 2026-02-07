import type { ArtifactBase, ToolType } from "@/types/artifact";

/**
 * Tool-type specific UI patterns and instructions
 */
const TOOL_TYPE_PATTERNS: Record<ToolType, string> = {
  converter: `## CONVERTER TOOL PATTERN
This is a FILE CONVERSION tool. The user uploads a file and gets a converted output.

REQUIRED UI COMPONENTS:
1. **Drop Zone / File Input**: Large, beautiful drag-and-drop area with:
   - Dashed border, rounded corners (border-2 border-dashed border-gray-300 rounded-xl)
   - Icon in center (upload cloud icon using SVG)
   - "Glissez votre fichier ici ou cliquez pour sélectionner" text
   - Accepted file types clearly shown
   - File size limit info

2. **File Preview**: After upload, show:
   - File name and size
   - Preview if possible (image thumbnail, PDF first page)
   - Remove/change file button

3. **Convert Button**: Large, prominent CTA button
   - Disabled until file is uploaded
   - Loading state with spinner during conversion

4. **Result Area**: After conversion:
   - Success message with checkmark
   - Download button for converted file
   - Preview of result if applicable
   - "Convertir un autre fichier" button

FILE HANDLING CODE:
- Use <input type="file" accept=".pdf,.png,.jpg" /> with proper accept attribute
- Use FileReader API to read files
- For PDF to image: Use canvas and PDF.js concepts (simulate with placeholder)
- For image conversions: Use canvas API
- Create downloadable blob with URL.createObjectURL()

EXAMPLE FILE INPUT COMPONENT:
\`\`\`jsx
const [file, setFile] = useState(null);
const [isDragging, setIsDragging] = useState(false);

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile) setFile(droppedFile);
};

<div
  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
  onDragLeave={() => setIsDragging(false)}
  onDrop={handleDrop}
  className={\`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all \${
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
  }\`}
>
  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file-input" accept=".pdf" />
  <label htmlFor="file-input" className="cursor-pointer">
    {/* Upload icon SVG */}
    <p className="text-gray-600">Glissez votre fichier ici</p>
  </label>
</div>
\`\`\``,

  calculator: `## CALCULATOR TOOL PATTERN
This is a CALCULATION tool. Users input values and get computed results.

REQUIRED UI COMPONENTS:
1. **Input Section**: Clean form with:
   - Clearly labeled input fields
   - Number inputs with proper formatting
   - Currency symbols where needed
   - Unit labels (€, %, kg, etc.)

2. **Calculate Button**: Or auto-calculate on input change

3. **Results Display**: Prominent, visually distinct:
   - Large result number with proper formatting
   - Breakdown of calculation steps
   - Visual indicators (progress bars, charts if relevant)

4. **History/Comparison** (optional): Previous calculations

DESIGN:
- Use a card-based layout
- Results should be visually prominent (larger font, colored background)
- Consider using a two-column layout: inputs left, results right`,

  tracker: `## TRACKER TOOL PATTERN
This is a DATA TRACKING tool. Users add entries over time and view history.

REQUIRED UI COMPONENTS:
1. **Quick Add Form**: Compact form at top for adding entries
   - Inline form (horizontal on desktop)
   - Clear submit button

2. **Stats Dashboard**: Summary cards showing:
   - Total count
   - Recent activity
   - Key metrics (sum, average, etc.)

3. **Entries List/Table**:
   - Sortable columns
   - Search/filter capability
   - Edit and delete actions
   - Pagination if many entries

4. **Visual Charts** (optional): Progress over time

DATA PERSISTENCE:
- Always use localStorage to persist data
- Load data on component mount with useEffect`,

  generator: `## GENERATOR TOOL PATTERN
This is a CONTENT GENERATION tool. Users configure options and generate output.

REQUIRED UI COMPONENTS:
1. **Configuration Panel**: Options to customize generation
   - Dropdowns, checkboxes, sliders
   - Presets if applicable

2. **Generate Button**: Prominent CTA

3. **Output Area**:
   - Generated content display
   - Copy to clipboard button
   - Regenerate button
   - Download/export options`,

  viewer: `## VIEWER TOOL PATTERN
This is a CONTENT VIEWING tool. Display and navigate content.

REQUIRED UI COMPONENTS:
1. **Content Display**: Main viewing area
   - Zoom controls if applicable
   - Navigation (prev/next)

2. **Sidebar/Toolbar**: Controls and options

3. **Info Panel**: Metadata about content`,

  editor: `## EDITOR TOOL PATTERN
This is a CONTENT EDITING tool.

REQUIRED UI COMPONENTS:
1. **Editor Area**: Main editing interface
   - Toolbar with formatting options
   - Real-time preview if applicable

2. **Save/Export**: Actions to save work`,

  dashboard: `## DASHBOARD TOOL PATTERN
This is an ANALYTICS DASHBOARD.

REQUIRED UI COMPONENTS:
1. **Metric Cards**: Key stats in card format
   - Icon, value, label, trend indicator

2. **Charts/Graphs**: Visual data representation

3. **Data Table**: Detailed breakdown`,

  form: `## FORM TOOL PATTERN
This is a DATA COLLECTION form.

REQUIRED UI COMPONENTS:
1. **Form Fields**: Well-organized inputs
   - Proper validation
   - Error messages
   - Progress indicator for multi-step

2. **Submit Button**: Clear CTA

3. **Success State**: Confirmation after submission`,

  search: `## SEARCH TOOL PATTERN
This is a SEARCH interface.

REQUIRED UI COMPONENTS:
1. **Search Input**: Prominent search bar
   - Auto-suggest if applicable
   - Clear button

2. **Filters**: Refinement options

3. **Results List**: Search results with:
   - Highlight matching terms
   - Pagination
   - Sort options`,

  comparison: `## COMPARISON TOOL PATTERN
This is a COMPARISON tool.

REQUIRED UI COMPONENTS:
1. **Item Selection**: Add items to compare

2. **Comparison Table/Grid**: Side-by-side view
   - Highlight differences
   - Best/worst indicators`,

  custom: `## CUSTOM TOOL
Generate appropriate UI based on the description provided.`,
};

/**
 * Design system instructions for beautiful UI
 */
const DESIGN_SYSTEM = `
## DESIGN SYSTEM - MODERN & PROFESSIONAL UI

### Color Palette
Use a cohesive color scheme:
- Primary: Blue shades (blue-500, blue-600) for actions and highlights
- Success: Green (green-500) for positive states
- Error: Red (red-500) for errors and destructive actions
- Neutral: Gray scale for text and backgrounds
- Background: Use subtle gradients (from-gray-50 to-white)

### Typography
- Headings: font-bold, tracking-tight
- Body: text-gray-600 for secondary text
- Numbers/Data: font-mono for monospace alignment

### Spacing & Layout
- Use consistent padding: p-4, p-6, p-8
- Card-based layout with shadow-sm or shadow-md
- Rounded corners: rounded-lg or rounded-xl
- Adequate whitespace between sections

### Components Style
- Buttons:
  - Primary: bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors
  - Secondary: bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg
  - Danger: bg-red-600 hover:bg-red-700 text-white

- Inputs:
  - border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent

- Cards:
  - bg-white rounded-xl shadow-sm border border-gray-100 p-6

- Tables:
  - Striped rows: even:bg-gray-50
  - Hover state: hover:bg-gray-100
  - Header: bg-gray-50 font-medium text-gray-700

### Icons (use inline SVG)
Common icons to include as inline SVG:
- Upload: cloud with arrow
- Download: arrow pointing down
- Check: checkmark
- X: close/delete
- Plus: add
- Search: magnifying glass
- Trash: delete
- Edit: pencil

### Animations
- Use transition-all for smooth state changes
- Loading spinner: animate-spin
- Hover effects: hover:scale-105 for interactive elements

### Responsive Design
- Use responsive prefixes: sm:, md:, lg:
- Mobile-first approach
- Stack on mobile, side-by-side on desktop: flex flex-col md:flex-row
`;

/**
 * Main system prompt for code generation
 */
const SYSTEM_PROMPT = `You are a senior React developer and UI/UX expert. You create beautiful, functional single-file React applications.

## CRITICAL REQUIREMENTS

### Code Structure (MANDATORY)
\`\`\`jsx
import { useState, useEffect, useCallback, useMemo } from 'react';

function App() {
  // Your component code here
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Your JSX here */}
    </div>
  );
}

export default App;
\`\`\`

### Output Rules
- Output ONLY the JSX code. No explanations, no markdown, no code fences.
- The code must be complete and functional.
- Use French for all user-facing text (labels, buttons, messages).

### React & State
- Use React hooks: useState, useEffect, useCallback, useMemo
- Do NOT import external libraries - everything must be self-contained
- Use localStorage for data persistence when appropriate
- Handle loading, error, and empty states

### File Handling (for file-based tools)
- Use HTML5 File API with <input type="file">
- Use FileReader for reading file contents
- Use canvas API for image manipulation
- Create download links with URL.createObjectURL()
- Always show file size and type validation

### API Calls
- You CAN use fetch() - all requests are proxied
- Prefer FREE APIs that need NO API key:
  * Weather: https://wttr.in/CITY?format=j1
  * Exchange rates: https://open.er-api.com/v6/latest/USD
  * IP geolocation: https://ipapi.co/json/
  * Random users: https://randomuser.me/api/
  * Placeholder: https://jsonplaceholder.typicode.com/
  * Countries: https://restcountries.com/v3.1/
- Handle loading and error states gracefully

${DESIGN_SYSTEM}

### Accessibility
- Use semantic HTML (main, section, article, nav)
- Include aria-labels for interactive elements
- Ensure good color contrast
- Support keyboard navigation
`;

/**
 * Detect tool type from artifact description and name
 */
function detectToolType(artifact: ArtifactBase): ToolType {
  const text = `${artifact.toolName} ${artifact.customDescription || ""} ${artifact.useCase}`.toLowerCase();

  // Converter patterns
  if (
    text.includes("convert") ||
    text.includes("convertisseur") ||
    text.includes("transformer") ||
    text.includes("pdf") ||
    text.includes("png") ||
    text.includes("jpg") ||
    text.includes("image") ||
    text.match(/\b\w+\s*(vers|to|->|→)\s*\w+\b/)
  ) {
    return "converter";
  }

  // Calculator patterns
  if (
    text.includes("calcul") ||
    text.includes("calculator") ||
    text.includes("compute") ||
    text.includes("taux") ||
    text.includes("pourcentage") ||
    text.includes("imc") ||
    text.includes("salaire") ||
    text.includes("pret") ||
    text.includes("loan")
  ) {
    return "calculator";
  }

  // Tracker patterns
  if (
    text.includes("suivi") ||
    text.includes("track") ||
    text.includes("gestion") ||
    text.includes("depense") ||
    text.includes("budget") ||
    text.includes("temps") ||
    text.includes("tache") ||
    text.includes("todo") ||
    text.includes("liste")
  ) {
    return "tracker";
  }

  // Generator patterns
  if (
    text.includes("generat") ||
    text.includes("creer") ||
    text.includes("random") ||
    text.includes("password") ||
    text.includes("lorem") ||
    text.includes("qr code")
  ) {
    return "generator";
  }

  // Dashboard patterns
  if (
    text.includes("dashboard") ||
    text.includes("tableau de bord") ||
    text.includes("statistique") ||
    text.includes("analytics")
  ) {
    return "dashboard";
  }

  // Search patterns
  if (
    text.includes("recherche") ||
    text.includes("search") ||
    text.includes("trouver") ||
    text.includes("filtre")
  ) {
    return "search";
  }

  // Use artifact toolType if set, otherwise default to custom
  return artifact.toolType || "custom";
}

/**
 * Builds the generation prompt from the structured artifact.
 * Includes tool-type-specific instructions for intelligent UI generation.
 */
export function buildGenerationPrompt(artifact: ArtifactBase): string {
  const parts: string[] = [];

  // Detect or use specified tool type
  const toolType = artifact.toolType || detectToolType(artifact);

  // Tool name and description
  parts.push(`# Créer: "${artifact.toolName}"`);
  parts.push(`**Type d'outil**: ${toolType.toUpperCase()}`);

  if (artifact.customDescription) {
    parts.push(`\n**Description**: ${artifact.customDescription}`);
  }

  // Add tool-type-specific patterns
  parts.push("\n" + TOOL_TYPE_PATTERNS[toolType]);

  // Entities and fields (if defined)
  if (artifact.entities.length > 0) {
    parts.push("\n## Données et Champs\n");
    for (const entity of artifact.entities) {
      parts.push(`### ${entity.name}`);
      if (entity.fields.length > 0) {
        parts.push("Champs requis:");
        for (const field of entity.fields) {
          let fieldDesc = `- **${field.name}** (type: ${field.type})`;
          if (field.accept) fieldDesc += ` [accept: ${field.accept}]`;
          if (field.required) fieldDesc += ` *requis*`;
          if (field.placeholder) fieldDesc += ` placeholder: "${field.placeholder}"`;
          if (field.options && field.options.length > 0) {
            fieldDesc += ` options: [${field.options.join(", ")}]`;
          }
          parts.push(fieldDesc);
        }
      }
      parts.push("");
    }
  } else {
    // If no entities defined, infer from tool type and description
    parts.push("\n## Structure suggérée");
    parts.push("Crée la structure de données appropriée basée sur le type d'outil et la description.");
  }

  // Business rules
  if (artifact.rules.length > 0) {
    parts.push("\n## Règles Métier\n");
    for (const rule of artifact.rules) {
      parts.push(`- SI **${rule.condition}** ALORS **${rule.action}**`);
    }
  }

  // Design preferences
  if (artifact.designPreferences) {
    parts.push("\n## Préférences de Design");
    parts.push(`- Style: ${artifact.designPreferences.style}`);
    if (artifact.designPreferences.primaryColor) {
      parts.push(`- Couleur principale: ${artifact.designPreferences.primaryColor}`);
    }
    if (artifact.designPreferences.darkMode) {
      parts.push(`- Mode sombre activé`);
    }
  }

  // Final requirements
  parts.push("\n## Exigences Finales");
  parts.push("- Interface 100% en français");
  parts.push("- Design moderne et professionnel (voir DESIGN_SYSTEM)");
  parts.push("- Gestion des états: loading, error, empty, success");
  parts.push("- Validation des entrées utilisateur");
  parts.push("- Responsive: fonctionne sur mobile et desktop");
  parts.push("- Persistance localStorage si approprié");

  return parts.join("\n");
}

export { SYSTEM_PROMPT, TOOL_TYPE_PATTERNS, DESIGN_SYSTEM, detectToolType };
