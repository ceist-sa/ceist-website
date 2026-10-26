import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings } from '$lib/server/data';
import { getAlbumPhotos } from '$lib/server/immich';

export const GET: RequestHandler = async () => {
    return json(await getAlbumPhotos(getSettings().galleryAlbumUrl));
};
