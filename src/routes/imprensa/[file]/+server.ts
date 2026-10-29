import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPressFile, openPressFile, pressKindFromName, PRESS_FILES } from '$lib/server/press';

// Serves the press kit files uploaded from /admin, e.g. /imprensa/CEIST-kit-de-comunicacao.zip
export const GET: RequestHandler = ({ params, request }) => {
    const kind = pressKindFromName(params.file);
    const file = kind && getPressFile(kind);
    if (!kind || !file) {
        error(404, 'Ficheiro não encontrado');
    }

    const lastModified = new Date(file.updatedAt).toUTCString();
    const headers = {
        'Last-Modified': lastModified,
        // Revalidate every time, so a newly uploaded kit is picked up straight away
        'Cache-Control': 'public, no-cache'
    };

    const since = request.headers.get('If-Modified-Since');
    if (since && new Date(since).getTime() >= new Date(lastModified).getTime()) {
        return new Response(null, { status: 304, headers });
    }

    return new Response(openPressFile(kind), {
        headers: {
            ...headers,
            'Content-Type': PRESS_FILES[kind].type,
            'Content-Length': String(file.size),
            // The PDF opens in the browser; the zip downloads
            'Content-Disposition': `${kind === 'pdf' ? 'inline' : 'attachment'}; filename="${file.name}"`
        }
    });
};
