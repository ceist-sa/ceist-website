import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSections, saveSections } from '$lib/server/data';

export const GET: RequestHandler = async () => {
    const sections = getSections();
    return json(sections);
};

export const PUT: RequestHandler = async ({ request }) => {
    const sections = await request.json();
    saveSections(sections);

    return json(sections);
};
