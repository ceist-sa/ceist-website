import type { NewsItem } from '$lib/data/news';

/** Today's date in Lisbon as YYYY-MM-DD, the same format concerts are stored in. */
export function lisbonToday(): string {
    // en-CA formats dates as YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date());
}

/** A concert stays upcoming until the end of its day. */
export function isUpcoming(concert: NewsItem): boolean {
    return concert.date >= lisbonToday();
}

/** Parses a YYYY-MM-DD date from its parts so it isn't shifted by the visitor's timezone. */
export function parseConcertDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/** URL path segment for a concert, e.g. "3-concerto-de-natal". */
export function concertSlug(concert: NewsItem): string {
    const title = concert.title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return title ? `${concert.id}-${title}` : concert.id;
}

export function concertUrl(concert: NewsItem): string {
    return `/concertos/${concertSlug(concert)}`;
}

/** Extracts the concert id from a slug produced by `concertSlug`. */
export function idFromSlug(slug: string): string {
    return slug.split('-')[0];
}
