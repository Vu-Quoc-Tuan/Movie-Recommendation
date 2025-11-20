import { getApiEndpoint } from "../../../lib/api/apiClient";
import { SUPABASE_PUBLIC_ANON_KEY } from "../../../lib/supabase/config";

export async function loginApi(email: string, password: string) {
    const response = await fetch(getApiEndpoint('/auth/login'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_PUBLIC_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Đăng nhập thất bại');
    }

    return response.json();
}

export async function registerApi(email: string, password: string, name: string) {
    const response = await fetch(getApiEndpoint('/auth/register'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_PUBLIC_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Đăng ký thất bại');
    }

    return response.json();
}
