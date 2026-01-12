import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGalleryPhotos, saveGalleryPhotos } from '$lib/server/data';

export const GET: RequestHandler = async () => {
    const photos = getGalleryPhotos();
    return json(photos);
};

export const POST: RequestHandler = async ({ request }) => {
    const { url } = await request.json();
    const photos = getGalleryPhotos();

    // Generate a new ID
    const maxId = photos.reduce((max, p) => {
        const id = parseInt(p.id, 10);
        return id > max ? id : max;
    }, 0);

    const newPhoto = {
        id: String(maxId + 1),
        url
    };

    photos.push(newPhoto);
    saveGalleryPhotos(photos);

    return json(newPhoto, { status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const { id } = await request.json();
    const photos = getGalleryPhotos();

    const filtered = photos.filter(p => p.id !== id);
    if (filtered.length === photos.length) {
        return json({ error: 'Photo not found' }, { status: 404 });
    }

    saveGalleryPhotos(filtered);

    return json({ success: true });
};
