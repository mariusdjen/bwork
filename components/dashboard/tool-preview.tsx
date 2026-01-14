"use client";

type Props = {
	url?: string | null;
};

export function ToolPreview({ url }: Props) {
	const hasUrl = url && /^https?:\/\//i.test(url);

	return (
		<div className="mt-3 overflow-hidden rounded-lg border bg-slate-50">
			{hasUrl ? (
				<div className="relative aspect-video bg-slate-100">
					{/* Iframe en arrière-plan, volontairement peu visible */}
					<iframe
						src={url!}
						title="Aperçu outil (non interactif)"
						className="absolute inset-0 h-full w-full border-0 opacity-25 blur-[1px] pointer-events-none"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/90" />
					<div className="relative z-10 flex h-full items-center justify-center px-3 text-center text-xs text-slate-600">
						Aperçu chargé en arrière-plan (non interactif). Ouvrez l’outil pour le voir en plein écran.
					</div>
				</div>
			) : (
				<div className="aspect-video flex items-center justify-center text-xs text-slate-500">
					Aucun aperçu disponible
				</div>
			)}
		</div>
	);
}

