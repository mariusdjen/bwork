import { Toaster } from "sonner";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<section className="h-screen flex flex-col ">
			{children}
			<Toaster position="bottom-right" duration={8000} />
		</section>
	);
}
