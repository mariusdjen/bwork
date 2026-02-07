export default function DeployedToolNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Cet outil n&apos;existe pas ou a ete desactive.
        </p>
      </div>
    </div>
  );
}
