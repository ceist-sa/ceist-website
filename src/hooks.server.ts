import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
    const url = event.url.pathname;

    // Protect admin routes and write API endpoints
    const isProtectedRoute = url.startsWith('/admin') ||
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
        const base64Credentials = authHeader.slice(6);
        const credentials = atob(base64Credentials);
        const [, password] = credentials.split(':');

        if (password !== env.ADMIN_PASSWORD) {
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
