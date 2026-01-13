import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

const isUsingAIGateway = !!process.env.AI_GATEWAY_API_KEY;
const aiGatewayBaseURL = "https://ai-gateway.vercel.sh/v1";

const openai = createOpenAI({
	apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY,
	baseURL: isUsingAIGateway ? aiGatewayBaseURL : process.env.OPENAI_BASE_URL,
});

const groq = createGroq({
	apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.GROQ_API_KEY,
	baseURL: isUsingAIGateway ? aiGatewayBaseURL : undefined,
});

const questionsSchema = z.object({
	questions: z
		.array(
			z.object({
				fieldKey: z.string(),
				label: z.string(),
				placeholder: z.string().optional(),
				example: z.string().optional(),
			})
		)
		.min(3)
		.max(8),
});

const fallbackQuestions = [
	{
		fieldKey: "workflow",
		label: "Quelles étapes/états pour vos données ?",
		placeholder: "Ex: Brouillon → En revue → Validé → Archivé",
		example: "Qui valide ? Quelles règles de passage ?",
	},
	{
		fieldKey: "champs",
		label: "Quelles informations faut-il stocker ?",
		placeholder:
			"Ex: Titre, description, service, priorité, statut, assigné à, deadline",
		example: "Champs obligatoires ? Formats à respecter ?",
	},
	{
		fieldKey: "roles",
		label: "Qui peut faire quoi ?",
		placeholder: "Ex: Opérateur crée/édite, Manager valide, Lecture seule",
		example: "Permissions par rôle, validations nécessaires",
	},
	{
		fieldKey: "notifications",
		label: "Notifications / suivi",
		placeholder: "Ex: Mail/Slack à la validation, rappel avant deadline",
		example: "Qui reçoit quoi, et quand ?",
	},
	{
		fieldKey: "vue",
		label: "Vue souhaitée",
		placeholder: "Ex: Liste filtrable + formulaire de création",
		example: "Tri, filtres, recherches indispensables",
	},
];

export async function POST(req: NextRequest) {
	try {
		const { description, model } = await req.json();

		if (!description || typeof description !== "string") {
			return NextResponse.json(
				{ error: "description is required" },
				{ status: 400 }
			);
		}

		const selectedModel =
			model && typeof model === "string"
				? model
				: process.env.OPENAI_MODEL || "openai/gpt-4o-mini";

		const aiModel = selectedModel.startsWith("openai/")
			? openai(selectedModel.replace("openai/", ""))
			: groq(selectedModel.replace("groq/", ""));

		try {
			const result = await generateObject({
				model: aiModel,
				schema: questionsSchema,
				prompt: `Tu es PM d'un SaaS B2B qui génère des outils internes. 
Propose une liste courte de questions supplémentaires pour clarifier le besoin utilisateur (en français), adaptées à la description suivante:

"${description}"

Contraintes:
- 5 questions max, claires et concrètes
- Utilise des labels courts
- Donne un placeholder ou exemple pour chaque
- Concentre-toi sur données à capturer, workflow, rôles/permissions, règles, notifications ou vues utiles.
Répond uniquement avec la structure JSON attendue.`,
			});

			const questions =
				result.object?.questions && result.object.questions.length > 0
					? result.object.questions
					: fallbackQuestions;

			return NextResponse.json({ success: true, questions });
		} catch (err) {
			console.error("[brief-questions] AI call failed, using fallback", err);
			return NextResponse.json({ success: true, questions: fallbackQuestions });
		}
	} catch (error: any) {
		console.error("[brief-questions] Error:", error);
		return NextResponse.json(
			{ error: error?.message || "Unexpected error" },
			{ status: 500 }
		);
	}
}
