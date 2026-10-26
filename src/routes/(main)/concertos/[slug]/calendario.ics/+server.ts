import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConcert } from '$lib/server/data';
import { concertSlug, idFromSlug } from '$lib/concerts';

// Concerts don't have an end time, so assume they last two hours
const DEFAULT_DURATION = 'PT2H';

function escapeText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export const GET: RequestHandler = ({ params, url }) => {
    const concert = getConcert(idFromSlug(params.slug));
    if (!concert) {
        error(404, 'Concerto não encontrado');
    }

    const date = concert.date.replaceAll('-', '');
    const time = concert.time ? concert.time.replace(':', '') + '00' : '';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const pageUrl = new URL(`/concertos/${concertSlug(concert)}`, url.origin).href;

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CEIST//Concertos//PT',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:concerto-${concert.id}@${url.hostname}`,
        `DTSTAMP:${stamp}`,
        ...(time
            ? [`DTSTART;TZID=Europe/Lisbon:${date}T${time}`, `DURATION:${DEFAULT_DURATION}`]
            : [`DTSTART;VALUE=DATE:${date}`]),
        `SUMMARY:${escapeText(`${concert.title} — CEIST`)}`,
        `LOCATION:${escapeText(concert.location)}`,
        `DESCRIPTION:${escapeText(`${concert.description}\n\n${pageUrl}`)}`,
        `URL:${pageUrl}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return new Response(lines.join('\r\n') + '\r\n', {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="ceist-${concertSlug(concert)}.ics"`
        }
    });
};
