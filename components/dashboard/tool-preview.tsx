"use client";

type Props = {
	url?: string | null;
};

export function ToolPreview({ url }: Props) {
	const hasUrl = url && /^https?:\/\//i.test(url);

	return (
		<div className="mt-3 overflow-hidden rounded-lg border bg-slate-50">
			{hasUrl ? (
				<div className="aspect-video relative">
					<iframe
						src={url!}
						title="Aperçu outil"
						className="absolute inset-0 h-full w-full border-0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/>
				</div>
			) : (
				<div className="aspect-video flex items-center justify-center text-xs text-slate-500">
					Aucun aperçu disponible
				</div>
			)}
		</div>
	);
}

