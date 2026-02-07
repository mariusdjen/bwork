import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { StartScreenClient } from "@/components/bwork/guidance/start-screen-client";

export default async function CreateStartPage() {
  const { user } = await getUserOrg();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-[60vh] items-start justify-center pt-12">
      <StartScreenClient />
    </main>
  );
}
