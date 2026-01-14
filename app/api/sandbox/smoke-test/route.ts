"use server";

import { NextResponse } from "next/server";
import { sandboxManager } from "@/lib/sandbox/sandbox-manager";

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const command = body?.command?.toString().trim() || "npm run build";
		const sandboxId = body?.sandboxId?.toString().trim() || null;

		// Récupère le provider courant (ou celui ciblé)
		let provider = sandboxId
			? sandboxManager.getProvider(sandboxId)
			: sandboxManager.getActiveProvider();

		if (!provider) {
			return NextResponse.json(
				{ ok: false, error: "sandbox-not-found" },
				{ status: 400 }
			);
		}

		const result = await provider.runCommand(command);
		const payload = {
			ok: result.success,
			stdout: result.stdout,
			stderr: result.stderr,
			exitCode: result.exitCode,
		};

		if (!result.success) {
			return NextResponse.json(payload, { status: 400 });
		}

		return NextResponse.json(payload);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Smoke test failed";
		return NextResponse.json(
			{ ok: false, error: message },
			{ status: 500 }
		);
	}
}

