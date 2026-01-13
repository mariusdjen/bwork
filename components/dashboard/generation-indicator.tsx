"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Gen = { id: string; status: string };

export function GenerationIndicator() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let timer: NodeJS.Timeout | null = null;
		const load = async () => {
			try {
				const res = await fetch("/api/generations", { cache: "no-store" });
				const data = await res.json();
				if (!res.ok || !data?.ok) return;
				const gens: Gen[] = data.generations || [];
				const running = gens.filter(
					(g) => g.status === "queued" || g.status === "running"
				).length;
				setCount(running);
			} catch {
				// ignore
			}
		};
		load();
		timer = setInterval(load, 10000);
		return () => {
			if (timer) clearInterval(timer);
		};
	}, []);

	if (count <= 0) return null;

	return (
		<Button asChild variant="outline" size="sm">
			<Link href="/dashboard/user/tools-list">
				Générations en cours ({count})
			</Link>
		</Button>
	);
}

