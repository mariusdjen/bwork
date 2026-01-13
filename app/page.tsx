"use client";

import Footer from "@/components/landing/footer";
import { HeroHeader } from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import Button from "@/components/ui/shadcn/button";
import Link from "next/link";

export default function HomePage() {
  return (
		<>
			<HeroHeader />
			<HeroSection />
			<Footer/>
		</>
	);
}
