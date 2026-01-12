import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { NewsItem } from '$lib/data/news';
import type { Section } from '$lib/data/members';
import type { GalleryPhoto } from '$lib/data/gallery';
import type { Album } from '$lib/data/albums';

export type { GalleryPhoto, Album };


const DATA_DIR = join(process.cwd(), 'data');
const CONCERTS_FILE = join(DATA_DIR, 'concerts.json');
const MEMBERS_FILE = join(DATA_DIR, 'members.json');
const GALLERY_FILE = join(DATA_DIR, 'gallery.json');
const ALBUMS_FILE = join(DATA_DIR, 'albums.json');

export function getConcerts(): NewsItem[] {
    if (!existsSync(CONCERTS_FILE)) {
        return [];
    }
    const data = readFileSync(CONCERTS_FILE, 'utf-8');
    return JSON.parse(data);
}

export function saveConcerts(concerts: NewsItem[]): void {
    writeFileSync(CONCERTS_FILE, JSON.stringify(concerts, null, 4), 'utf-8');
}

export function getSections(): Section[] {
    if (!existsSync(MEMBERS_FILE)) {
        return [];
    }
    const data = readFileSync(MEMBERS_FILE, 'utf-8');
    return JSON.parse(data);
}

export function saveSections(sections: Section[]): void {
    writeFileSync(MEMBERS_FILE, JSON.stringify(sections, null, 4), 'utf-8');
}

export function getGalleryPhotos(): GalleryPhoto[] {
    if (!existsSync(GALLERY_FILE)) {
        return [];
    }
    const data = readFileSync(GALLERY_FILE, 'utf-8');
    return JSON.parse(data);
}

export function saveGalleryPhotos(photos: GalleryPhoto[]): void {
    writeFileSync(GALLERY_FILE, JSON.stringify(photos, null, 4), 'utf-8');
}

export function getAlbums(): Album[] {
    if (!existsSync(ALBUMS_FILE)) {
        return [];
    }
    const data = readFileSync(ALBUMS_FILE, 'utf-8');
    return JSON.parse(data);
}

export function saveAlbums(albums: Album[]): void {
    // Sort by date descending (newest first)
    const sorted = albums.toSorted((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    writeFileSync(ALBUMS_FILE, JSON.stringify(sorted, null, 4), 'utf-8');
}

