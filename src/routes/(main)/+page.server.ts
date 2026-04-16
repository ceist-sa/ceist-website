import type { PageServerLoad } from './$types';
import { getConcerts, getSections, getGalleryPhotos, getSettings } from '$lib/server/data';

export const load: PageServerLoad = async () => {
    return {
        concerts: getConcerts(),
        sections: getSections(),
        galleryPhotos: getGalleryPhotos(),
        settings: getSettings()
    };
};
