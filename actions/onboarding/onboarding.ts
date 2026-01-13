"use server";

import { createClient } from "@/utils/supabase/server";

export const getFreePlan = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("id, code")
      .eq("code", "free")
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching free plan:", error);
    return null;
  }
};

export async function markFirstLoginAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return { ok: false, message: "Non connecté" };

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("id, first_login_done")
      .eq("user_id", user.id)
      .single();

    if (subError) throw subError;

    if (sub && !sub.first_login_done) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ first_login_done: true })
        .eq("id", sub.id);
      
      if (updateError) throw updateError;
    }

    return { ok: true };
  } catch (error) {
    console.error("Error marking first login:", error);
    return { ok: false, message: "Une erreur est survenue" };
  }
}

export async function payLaterAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return { ok: false, message: "Non connecté" };

    const freePlan = await getFreePlan();

    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("id, first_login_done")
      .eq("user_id", user.id)
      .single();

    if (subError) throw subError;

    if (sub && !sub.first_login_done) {
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ first_login_done: true, status: "active", plan_id: freePlan?.id })
        .eq("id", sub.id);
      
      if (updateError) throw updateError;
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in payLaterAction:", error);
    return { ok: false, message: "Une erreur est survenue" };
  }
}
