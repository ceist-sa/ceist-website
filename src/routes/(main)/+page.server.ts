import type { PageServerLoad } from './$types';
import { getUpcomingConcerts, getSections, getSettings } from '$lib/server/data';
import { getAlbumPhotos } from '$lib/server/immich';

// The gallery shows a few photos at a time, so a random sample is plenty
const GALLERY_SAMPLE_SIZE = 30;

function randomSample<T>(items: T[], size: number): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, size);
}

export const load: PageServerLoad = async () => {
    const settings = getSettings();
    const photos = await getAlbumPhotos(settings.galleryAlbumUrl);

    return {
        concerts: getUpcomingConcerts(),
        sections: getSections(),
        galleryPhotos: randomSample(photos, GALLERY_SAMPLE_SIZE),
        settings
    };
};
