const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

async function fetchAPI(endpoint: string, options: RequestInit = {}, token?: string, signal?: AbortSignal) {
    const headers: HeadersInit = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
    };
    const response = await fetch(BASE_URL + endpoint, { ...options, headers, signal });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || response.statusText);
    }
    return data;
}
const API = {
    get: (endpoint: string, token?: string, signal?: AbortSignal) =>
        fetchAPI(endpoint, { method: "GET" }, token, signal),
    post: (endpoint: string, body: any, token?: string, signal?: AbortSignal) =>
        fetchAPI(endpoint, { method: "POST", body: JSON.stringify(body) }, token, signal),
    put: (endpoint: string, body: any, token?: string, signal?: AbortSignal) =>
        fetchAPI(endpoint, { method: "PUT", body: JSON.stringify(body) }, token, signal),
    delete: (endpoint: string, body?: any, token?: string, signal?: AbortSignal) =>
        fetchAPI(endpoint,
            {
                method: "DELETE",
                ...(body ? { body: JSON.stringify(body) } : {}),
            }, token, signal),
};

export default API;
