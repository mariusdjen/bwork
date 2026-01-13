"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseAndUser, getUser } from "../authHelpers";
import crypto from "crypto";
import { Profile } from "@/types/users";
import { updateEmail } from "./auth";
export async function updateAvatar(file: File) {
	const random = crypto.randomBytes(5).toString("hex").toUpperCase();
	try {
		const ctx = await getSupabaseAndUser();
		if ("error" in ctx) return { ok: false, message: ctx.error };
		const { supabase, user } = ctx;

		const userId = user?.id;
		if (!userId) {
			return { ok: false, error: "Utilisateur non authentifié." };
		}

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from("users")
			.upload(`${userId}/avatar/${random}-${file.name}`, file, {
				cacheControl: "3600",
				upsert: false,
			});
		if (uploadError) {
			return { ok: false, message: uploadError.message };
		}

		const { data: oldProfileState } = await supabase
			.from("users")
			.select("avatar_path")
			.eq("id", user.id)
			.select()
			.single();

		const path = uploadData.path;
		const { data, error } = await supabase
			.from("users")
			.update({
				avatar_path: path,
			})
			.eq("id", user?.id)
			.select()
			.single();

		if (error) return { ok: false, message: error.message };
		const profile: Profile = data;

		if (oldProfileState.avatar_path) {
			await supabase.storage
				.from("users")
				.remove([oldProfileState.avatar_path]);
		}

		revalidatePath("/dashboard/profile");
		return { ok: true, profile };
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour de la photo.",
		};
	}
}

export async function createSignedUrl(path: string) {
	try {
		const ctx = await getSupabaseAndUser();
		if ("error" in ctx) return { ok: false, message: ctx.error };
		const { supabase } = ctx;

		const { data, error } = await supabase.storage
			.from("users")
			.createSignedUrl(path, 60 * 60);
		if (error || !data)
			return { ok: false, message: error.message || "Fichier non trouvé" };

		return { ok: true, signedUrl: data.signedUrl };
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error
					? error.message
					: "Erreur lors de la lecture du fichier.",
		};
	}
}

export async function updateProfile(profile: Profile, newProfile: Profile) {
	try {
		const ctx = await getSupabaseAndUser();
		if ("error" in ctx) return { ok: false, message: ctx.error };
		const { supabase, user } = ctx;

		if (user?.id === profile.id && profile.email !== newProfile.email) {
			const { data, error } = await updateEmail(profile.email);
			if (error || !data) {
				return {
					ok: false,
					message: error || "Erreur lors de modification de l'email.",
				};
			}
		}

		const { data, error } = await supabase
			.from("users")
			.update({
				first_name: newProfile.first_name,
				last_name: newProfile.last_name,
				updated_at: new Date(),
			})
			.eq("id", profile.id)
			.select()
			.single();

		if (error) return { ok: false, message: error.message };

		if (user?.id !== profile.id) {
			revalidatePath("/dashboard/admin/users");
		} else {
			revalidatePath("/dashboard/profile");
		}

		return { ok: true, profile: data };
	} catch (error) {
		return {
			ok: false,
			message:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour du profil.",
		};
	}
}
