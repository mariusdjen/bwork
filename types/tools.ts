export type Tool = {
	id: string;
	user_id: string;
	title: string;
	description?: string | null;
	sandbox_url: string;
	is_public?: boolean | null;
	created_at: string;
};

