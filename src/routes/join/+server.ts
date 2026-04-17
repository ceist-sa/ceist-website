import { redirect } from '@sveltejs/kit';
import { getSettings } from '$lib/server/data';

export function GET() {
    const settings = getSettings();
    if (!settings.joinFormUrl) {
        redirect(302, '/');
    }
    redirect(302, settings.joinFormUrl);
}
