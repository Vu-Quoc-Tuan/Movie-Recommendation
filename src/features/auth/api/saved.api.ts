import { getApiEndpoint } from "../../../lib/api/apiClient";

export async function fetchUserSaved(token: string) {
    const response = await fetch(getApiEndpoint('/user/saved'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Fetch saved error:', error);
        return [];
    }

    return response.json();
}

export async function saveMovieApi(token: string, movieId: string) {
    const response = await fetch(getApiEndpoint('/user/save'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_id: movieId }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Save movie error:', error);
        throw new Error(error || 'Lưu phim thất bại');
    }

    return response.json();
}
