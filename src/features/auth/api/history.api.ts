import { getApiEndpoint } from "../../../lib/api/apiClient";

export async function fetchUserHistory(token: string) {
    const response = await fetch(getApiEndpoint('/user/history'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Fetch history error:', error);
        return [];
    }

    return response.json();
}

