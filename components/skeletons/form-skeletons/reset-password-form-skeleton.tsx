import { Skeleton } from "@/components/ui/skeleton";

export function ResetPasswordFormSkeleton() {
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-10 w-full" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-10 w-full" />
			</div>
			<Skeleton className="h-11 w-full" />
		</div>
	);
}
