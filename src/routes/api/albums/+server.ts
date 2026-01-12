import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAlbums, saveAlbums } from '$lib/server/data';

export const GET: RequestHandler = async () => {
    const albums = getAlbums();
    return json(albums);
};

export const POST: RequestHandler = async ({ request }) => {
    const { title, date, location, coverUrl, albumUrl } = await request.json();
    const albums = getAlbums();

    // Generate a new ID
    const maxId = albums.reduce((max, a) => {
        const id = parseInt(a.id, 10);
        return id > max ? id : max;
    }, 0);

    const newAlbum = {
        id: String(maxId + 1),
        title,
        date,
        location,
        coverUrl,
        albumUrl
    };

    albums.push(newAlbum);
    saveAlbums(albums);

    return json(newAlbum, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
    const updatedAlbum = await request.json();
    const albums = getAlbums();

    const index = albums.findIndex(a => a.id === updatedAlbum.id);
    if (index === -1) {
        return json({ error: 'Album not found' }, { status: 404 });
    }

    albums[index] = updatedAlbum;
    saveAlbums(albums);

    return json(updatedAlbum);
};

export const DELETE: RequestHandler = async ({ request }) => {
    const { id } = await request.json();
    const albums = getAlbums();

    const filtered = albums.filter(a => a.id !== id);
    if (filtered.length === albums.length) {
        return json({ error: 'Album not found' }, { status: 404 });
    }

    saveAlbums(filtered);

    return json({ success: true });
};
