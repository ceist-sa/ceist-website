import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings, saveSettings } from '$lib/server/data';

export const GET: RequestHandler = () => {
    return json(getSettings());
};

export const PUT: RequestHandler = async ({ request }) => {
    // Merge so that saving one setting doesn't wipe the others
    const settings = { ...getSettings(), ...(await request.json()) };
    saveSettings(settings);
    return json(settings);
};
