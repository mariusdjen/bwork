"use client";

import Footer from "@/components/landing/footer";
import { HeroHeader } from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import { Pricing } from "@/components/landing/pricing";
import WhyChooseUs from "@/components/landing/why-choose-us";
import Button from "@/components/ui/shadcn/button";
import Link from "next/link";

export default function HomePage() {
  return (
		<>
			<HeroHeader />
			<HeroSection />
			<WhyChooseUs />
			<Pricing/>
			<Footer/>
		
		</>
	);
}
