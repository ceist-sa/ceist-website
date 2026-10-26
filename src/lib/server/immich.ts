import type { GalleryPhoto } from '$lib/data/gallery';

// How long the album contents are reused before asking Immich again
const CACHE_TTL = 10 * 60 * 1000;
// After a failed request, wait this long before trying again
const RETRY_DELAY = 60 * 1000;
const REQUEST_TIMEOUT = 5000;

interface ShareLink {
    origin: string;
    /** Either `key` (for /share/<key> links) or `slug` (for /s/<slug> links) */
    auth: URLSearchParams;
    /** Base path of the share link, e.g. "/share/<key>" */
    path: string;
}

/** Column-oriented assets returned by Immich's timeline API */
interface TimeBucketAssets {
    id: string[];
    isImage: boolean[];
    isTrashed: boolean[];
}

/** Parses an Immich share link such as https://photos.example.com/share/<key> or /s/<slug>. */
export function parseShareLink(shareUrl: string): ShareLink | null {
    try {
        const url = new URL(shareUrl);
        const match = url.pathname.match(/^\/(share|s)\/([^/]+)/);
        if (!match) return null;
        const [, kind, value] = match;
        return {
            origin: url.origin,
            auth: new URLSearchParams({ [kind === 'share' ? 'key' : 'slug']: value }),
            path: `/${kind}/${value}`
        };
    } catch {
        return null;
    }
}

async function immichGet<T>(link: ShareLink, path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`/api${path}`, link.origin);
    for (const [name, value] of [...link.auth, ...Object.entries(params)]) {
        url.searchParams.set(name, value);
    }
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    if (!response.ok) {
        throw new Error(`Immich ${path} responded with ${response.status}`);
    }
    return response.json();
}

async function fetchAlbumPhotos(shareUrl: string): Promise<GalleryPhoto[]> {
    const link = parseShareLink(shareUrl);
    if (!link) {
        throw new Error(`Not an Immich share link: ${shareUrl}`);
    }

    const sharedLink = await immichGet<{ album?: { id: string } }>(link, '/shared-links/me');
    const albumId = sharedLink.album?.id;
    if (!albumId) {
        throw new Error('The Immich share link is not for an album');
    }

    const buckets = await immichGet<{ timeBucket: string }[]>(link, '/timeline/buckets', { albumId });
    const bucketAssets = await Promise.all(
        buckets.map(({ timeBucket }) =>
            immichGet<TimeBucketAssets>(link, '/timeline/bucket', { albumId, timeBucket })
        )
    );

    const photos: GalleryPhoto[] = [];
    for (const assets of bucketAssets) {
        assets.id.forEach((id, i) => {
            if (!assets.isImage[i] || assets.isTrashed[i]) return;
            photos.push({
                id,
                url: `${link.origin}/api/assets/${id}/thumbnail?size=preview&${link.auth}`,
                link: `${link.origin}${link.path}/photos/${id}`
            });
        });
    }

    return photos;
}

let cache: { shareUrl: string; photos: GalleryPhoto[]; expiresAt: number } | null = null;
const pending = new Map<string, Promise<GalleryPhoto[]>>();

function refresh(shareUrl: string): Promise<GalleryPhoto[]> {
    const inFlight = pending.get(shareUrl);
    if (inFlight) return inFlight;

    const request = fetchAlbumPhotos(shareUrl)
        .then((photos) => {
            cache = { shareUrl, photos, expiresAt: Date.now() + CACHE_TTL };
            return photos;
        })
        .catch((e) => {
            console.error('Failed to load the Immich album:', e);
            const photos = cache?.shareUrl === shareUrl ? cache.photos : [];
            cache = { shareUrl, photos, expiresAt: Date.now() + RETRY_DELAY };
            return photos;
        })
        .finally(() => {
            pending.delete(shareUrl);
        });
    pending.set(shareUrl, request);
    return request;
}

/**
 * Photos of the Immich album behind `shareUrl`. Results are cached; once stale they are
 * still served while being refreshed in the background, so Immich never slows down the page.
 */
export async function getAlbumPhotos(shareUrl: string | undefined): Promise<GalleryPhoto[]> {
    if (!shareUrl) return [];

    const cached = cache?.shareUrl === shareUrl ? cache : null;
    if (!cached) return refresh(shareUrl);
    if (Date.now() >= cached.expiresAt) refresh(shareUrl);
    return cached.photos;
}
