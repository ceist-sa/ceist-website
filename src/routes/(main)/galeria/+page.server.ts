import type { PageServerLoad } from './$types';
import { getAlbums } from '$lib/server/data';

export const load: PageServerLoad = async () => {
    return {
        albums: getAlbums()
    };
};
