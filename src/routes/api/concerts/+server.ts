import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConcerts, saveConcerts } from '$lib/server/data';

export const GET: RequestHandler = async () => {
    const concerts = getConcerts();
    return json(concerts);
};

export const POST: RequestHandler = async ({ request }) => {
    const concert = await request.json();
    const concerts = getConcerts();

    // Generate a new ID
    const maxId = concerts.reduce((max, c) => {
        const id = parseInt(c.id, 10);
        return id > max ? id : max;
    }, 0);
    concert.id = String(maxId + 1);

    concerts.push(concert);
    saveConcerts(concerts);

    return json(concert, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
    const updatedConcert = await request.json();
    const concerts = getConcerts();

    const index = concerts.findIndex(c => c.id === updatedConcert.id);
    if (index === -1) {
        return json({ error: 'Concert not found' }, { status: 404 });
    }

    concerts[index] = updatedConcert;
    saveConcerts(concerts);

    return json(updatedConcert);
};

export const DELETE: RequestHandler = async ({ request }) => {
    const { id } = await request.json();
    const concerts = getConcerts();

    const filtered = concerts.filter(c => c.id !== id);
    if (filtered.length === concerts.length) {
        return json({ error: 'Concert not found' }, { status: 404 });
    }

    saveConcerts(filtered);

    return json({ success: true });
};
