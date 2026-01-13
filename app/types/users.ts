export type Profile = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    currency_code: string;
    country_code: string;
    created_at: string;
    updated_at: string;
    address?: string;
    position?: string;
    company_name?: string;
    phone?: string;
    avatar_path?: string;
    status: string;
    password_changed_at?: string;
    user_roles?: {
        role: string;
    };
}