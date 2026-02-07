import { redirect } from "next/navigation";
import { getUserOrg } from "@/lib/supabase/get-user-org";
import { ProfileInfo } from "@/components/bwork/profile/profile-info";
import { ProfileForm } from "@/components/bwork/profile/profile-form";

export default async function ProfilePage() {
  const { user, orgName, role } = await getUserOrg();

  if (!user) {
    redirect("/login");
  }

  const userName = (user.user_metadata?.name as string) || "";
  const userEmail = user.email || "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProfileInfo email={userEmail} role={role} orgName={orgName} />
        <ProfileForm defaultName={userName} />
      </div>
    </div>
  );
}
