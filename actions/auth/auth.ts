"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// authentication types
type SignUpCredentials = {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
};

type SignInCredentials = {
	email: string;
	password: string;
};

export async function signUp(values: SignUpCredentials) {
	console.log("signUp", values);
	try {
		const supabase = await createClient();

		const redirectBase = process.env.NEXT_PUBLIC_BASE_URL;
		const emailRedirectTo = redirectBase
			? `${redirectBase}/confirm`
			: undefined;

		const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
			{
				email: values.email,
				password: values.password,
				options: {
					data: {
						first_name: values.first_name,
						last_name: values.last_name,
					},
					// n'utiliser la redirection que si l'URL est définie
					...(emailRedirectTo ? { emailRedirectTo } : {}),
				},
			}
		);

		if (signUpError) {
			return { ok: false, error: signUpError.message };
		}
		if (!signUpData?.user) {
			return {
				ok: false,
				error: "Erreur lors de la création de l'utilisateur.",
			};
		}

		revalidatePath("/", "layout");

		return {
			ok: true,
			status: "success",
		};
	} catch (err: any) {
		console.error("SignUp Error:", err);
		return {
			ok: false,
			error:
				err?.message ||
				err?.error_description ||
				"Une erreur interne est survenue lors de l'inscription.",
		};
	}
}

export async function signIn(values: SignInCredentials) {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email: values.email,
		password: values.password,
	});

	if (error) {
		return { ok: false, error: error.message };
	}

	revalidatePath("/", "layout");

	return {
		ok: true,
		user: data.user,
	};
}

export async function signOut() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();
	if (error) {
		return {
			error: error?.message,
		};
	}
	revalidatePath("/", "layout");
	return {
		ok: true,
		status: "success",
	};
}

//invite user function
export async function inviteUser(email: string) {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
		redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invite`,
	});
	//get user id
	const userId = data?.user?.id;
	//assign role to user

	if (error) {
		return {
			error: error?.message,
		};
	}
	return {
		ok: true,
		status: "success",
		data: data,
	};
}

// Password reset function
export async function resetPassword(email: string) {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
	});
	if (error) {
		return {
			error: error?.message,
		};
	}
	return {
		ok: true,
		status: "success",
		data: data,
	};
}

// Update password function
export async function updatePassword(newPassword: string) {
	try {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) return { error: error.message, ok: false };

		if (data.user) {
			await supabase
				.from("users")
				.update({
					password_changed_at: new Date(),
					updated_at: new Date(),
				})
				.eq("id", data.user.id)
				.select()
				.single();
		}

		revalidatePath("/dashboard/profile");
		return { ok: true, data: data };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour.",
		};
	}
}

// Update User Email
export async function updateEmail(newEmail: string) {
	try {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.updateUser({ email: newEmail });
		if (error) return { error: error.message, ok: false };
		return { ok: true, data: data.user };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour du mail.",
		};
	}
}

// Send Reset Password link
export async function sendResetPasswordLink(email: string) {
	try {
		const supabase = await createClient();
		await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
		});
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour du mail.",
		};
	}
}

// Update Forgot Password
export async function updateForgotPassword(newPassword: string, code: string) {
	try {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			return { error: error.message, ok: false };
		}

		const { data: resetData, error: resetError } =
			await supabase.auth.updateUser({
				password: newPassword,
			});

		if (resetError) return { error: resetError.message, ok: false };

		if (resetData.user) {
			await supabase
				.from("users")
				.update({
					password_changed_at: new Date(),
					updated_at: new Date(),
				})
				.eq("id", resetData.user.id)
				.select()
				.single();
		}

		revalidatePath("/dashboard/reset-password");
		return { ok: true, data: resetData };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error
					? error.message
					: "Une erreur est survenue lors de la mise à jour.",
		};
	}
}
