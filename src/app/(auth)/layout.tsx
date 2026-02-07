export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          B-WORK
        </h1>
      </div>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
