import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getConcert } from '$lib/server/data';
import { concertSlug, idFromSlug, isUpcoming } from '$lib/concerts';

export const load: PageServerLoad = async ({ params }) => {
    const concert = getConcert(idFromSlug(params.slug));
    if (!concert) {
        error(404, 'Concerto não encontrado');
    }

    // Keep a single canonical URL even if the title (and so the slug) changes
    const slug = concertSlug(concert);
    if (params.slug !== slug) {
        redirect(301, `/concertos/${slug}`);
    }

    return {
        concert,
        upcoming: isUpcoming(concert),
        meta: {
            title: `${concert.title} — CEIST`,
            description: concert.description,
            image: concert.imageUrl
        }
    };
};
