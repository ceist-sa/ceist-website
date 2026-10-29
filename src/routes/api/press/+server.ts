import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePressFile, getPressFiles, isPressKind, savePressFile } from '$lib/server/press';

export const GET: RequestHandler = () => {
    return json(getPressFiles());
};

// The file is sent as the raw request body (not multipart), so it streams to disk instead of being held in memory.
// PUT /api/press?kind=zip|pdf
export const PUT: RequestHandler = async ({ request, url }) => {
    const kind = url.searchParams.get('kind');
    if (!isPressKind(kind)) {
        error(400, 'kind must be "zip" or "pdf"');
    }
    if (!request.body) {
        error(400, 'Empty upload');
    }
    try {
        return json(await savePressFile(kind, request.body));
    } catch (e) {
        error(400, e instanceof Error ? e.message : 'Upload failed');
    }
};

export const DELETE: RequestHandler = ({ url }) => {
    const kind = url.searchParams.get('kind');
    if (!isPressKind(kind)) {
        error(400, 'kind must be "zip" or "pdf"');
    }
    deletePressFile(kind);
    return json({ ok: true });
};
