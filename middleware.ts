import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function copyCookies(from: NextResponse, to: NextResponse) {
	from.cookies.getAll().forEach((c) =>
		to.cookies.set(c.name, c.value, {
			httpOnly: c.httpOnly,
			secure: c.secure,
			path: c.path,
			sameSite: c.sameSite,
			expires: c.expires,
			maxAge: c.maxAge,
		})
	);
}

export async function middleware(request: NextRequest) {
	if (request.method === "OPTIONS") return NextResponse.next();

	const { pathname, search } = request.nextUrl;
	const isApi = pathname.startsWith("/api");

	// Total skip for public/special roads: no Supabase here
	if (
		pathname.startsWith("/api/public") ||
		pathname.startsWith("/api/webhooks") ||
		pathname === "/auth/callback" ||
		pathname === "/logout"
	) {
		return NextResponse.next();
	}

	// From here: protected areas → we let Supabase manage cookies
	let supabaseResponse = NextResponse.next({ request });
	try {
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll: () => request.cookies.getAll(),
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value)
						);
						supabaseResponse = NextResponse.next({ request });
						cookiesToSet.forEach(({ name, value, options }) =>
							supabaseResponse.cookies.set(name, value, options)
						);
					},
				},
			}
		);

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			if (isApi) {
				const res = NextResponse.json(
					{ error: "Unauthorized" },
					{ status: 401 }
				);
				copyCookies(supabaseResponse, res);
				return res;
			}
			const toLogin = request.nextUrl.clone();
			toLogin.pathname = "/login";
			toLogin.searchParams.set("next", pathname + search);
			const res = NextResponse.redirect(toLogin);
			copyCookies(supabaseResponse, res);
			return res;
		}

		return supabaseResponse;
	} catch {
		const toLogin = request.nextUrl.clone();
		toLogin.pathname = "/login";
		toLogin.searchParams.set("next", pathname + search);
		const res = NextResponse.redirect(toLogin);
		return res;
	}
}

//  Whitelist: middleware is only executed where it is useful
export const config = {
	matcher: [
		"/admin/:path*",
		"/dashboard/:path*",
		"/settings/:path*", // if you have a settings area
		"/api/:path*", // all APIs → early return for /api/public & /api/webhooks
		"/auth/callback", // special public (OAuth/magic link)
		"/logout", // special public (clean session)
	],
};
