import type { PageServerLoad } from './$types';
import { getPressFiles } from '$lib/server/press';

export const load: PageServerLoad = () => {
    return {
        files: getPressFiles(),
        meta: {
            title: 'Imprensa — CEIST',
            description:
                'Kit de comunicação da CEIST para salas de concerto, parceiros e imprensa: guia, logótipos, textos de apresentação e fotografias.'
        }
    };
};
