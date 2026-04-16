import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings, saveSettings } from '$lib/server/data';

export const GET: RequestHandler = () => {
    return json(getSettings());
};

export const PUT: RequestHandler = async ({ request }) => {
    const settings = await request.json();
    saveSettings(settings);
    return json(settings);
};
