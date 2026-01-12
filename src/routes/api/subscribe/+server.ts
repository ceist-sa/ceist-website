import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email } = await request.json();

        if (!email) {
            return json({ error: 'Email é obrigatório' }, { status: 400 });
        }

        const auth = Buffer.from(`${env.LISTMONK_USERNAME}:${env.LISTMONK_PASSWORD}`).toString('base64');

        const response = await fetch(env.LISTMONK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                email: email,
                name: email.split('@')[0],
                status: 'enabled',
                lists: [1], // Defaulting to list ID 1
                preconfirm_subscriptions: true
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Listmonk API error:', response.status, errorBody);

            try {
                const errorData = JSON.parse(errorBody);
                if (errorData.message?.includes('duplicate') || errorData.message?.includes('exists')) {
                    return json({ error: 'Este email já está subscrito na nossa newsletter.' }, { status: 400 });
                }
            } catch (p) {
                // ignore parse error
            }

            return json({ error: 'Ocorreu um erro ao processar a subscrição.' }, { status: 500 });
        }

        return json({ success: true });
    } catch (e) {
        console.error('Subscription exception:', e);
        return json({ error: 'Erro de ligação com o servidor da newsletter.' }, { status: 502 });
    }
};
