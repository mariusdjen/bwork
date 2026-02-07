import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const plan = searchParams.get("plan");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Preserve pending plan through the redirect
      const isPaidPlan = plan === "pro" || plan === "business";
      const separator = next.includes("?") ? "&" : "?";
      const finalNext = isPaidPlan ? `${next}${separator}plan=${plan}` : next;
      return NextResponse.redirect(`${origin}${finalNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
