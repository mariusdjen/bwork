"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UpgradeBannerProps {
  message: string;
  ctaText?: string;
}

export function UpgradeBanner({
  message,
  ctaText = "Passer a un plan superieur",
}: UpgradeBannerProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-foreground">{message}</p>
        <Button asChild size="sm">
          <Link href="/pricing">
            {ctaText}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
