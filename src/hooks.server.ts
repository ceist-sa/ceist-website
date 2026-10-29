import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
    const url = event.url.pathname;

    // BODY_SIZE_LIMIT is raised in the Dockerfile so the press kit can be uploaded from /admin; every other request
    // keeps a small limit
    const isPressUpload = url === '/api/press' && event.request.method === 'PUT';
    const contentLength = Number(event.request.headers.get('Content-Length') ?? 0);
    if (!isPressUpload && contentLength > 1_000_000) {
        return new Response('Payload too large', { status: 413 });
    }

    // Protect admin routes, the team's email signature page and write API endpoints
    const isProtectedRoute = url.startsWith('/admin') || url.startsWith('/assinatura') ||
        (url.startsWith('/api/') && event.request.method !== 'GET' && url !== '/api/subscribe');

    if (isProtectedRoute) {
        const authHeader = event.request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return new Response('Authentication required', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="CEIST Admin"'
                }
            });
        }

        // Decode Basic auth: "Basic base64(username:password)"
        let password: string | undefined;
        try {
            const credentials = atob(authHeader.slice(6));
            const separator = credentials.indexOf(':');
            // The password may itself contain colons, so only split on the first one
            password = separator === -1 ? undefined : credentials.slice(separator + 1);
        } catch {
            password = undefined;
        }

        if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
            return new Response('Invalid credentials', {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Basic realm="CEIST Admin"'
                }
            });
        }
    }

    return resolve(event);
};
