import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});

const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

const robotoMono = Roboto_Mono({
	subsets: ["latin"],
	variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
	title: "B-WORK v0",
	description:
		"Re-imagine any website in seconds with AI-powered website builder.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} font-sans`}
			>
				<SessionProvider>
					{children}
					<Toaster />
				</SessionProvider>
			</body>
		</html>
	);
}
