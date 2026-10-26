import { redirect } from '@sveltejs/kit';
import { getSettings } from '$lib/server/data';

export function GET() {
    const { galleryAlbumUrl } = getSettings();
    redirect(302, galleryAlbumUrl || '/#gallery');
}
