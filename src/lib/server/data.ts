import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { NewsItem } from '$lib/data/news';
import type { Section } from '$lib/data/members';
import type { Settings } from '$lib/data/settings';
import { isUpcoming } from '$lib/concerts';

const DATA_DIR = join(process.cwd(), 'data');
const CONCERTS_FILE = join(DATA_DIR, 'concerts.json');
const MEMBERS_FILE = join(DATA_DIR, 'members.json');
const SETTINGS_FILE = join(DATA_DIR, 'settings.json');

export function getConcerts(): NewsItem[] {
    if (!existsSync(CONCERTS_FILE)) {
        return [];
    }
    const data = readFileSync(CONCERTS_FILE, 'utf-8');
    return JSON.parse(data);
}

/** Concerts happening today or later (Lisbon time), soonest first. */
export function getUpcomingConcerts(): NewsItem[] {
    return getConcerts()
        .filter(isUpcoming)
        .toSorted((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function getConcert(id: string): NewsItem | undefined {
    return getConcerts().find(c => c.id === id);
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

export function getSettings(): Settings {
    const defaults: Settings = { joinFormUrl: '', galleryAlbumUrl: '' };
    if (!existsSync(SETTINGS_FILE)) {
        return defaults;
    }
    const data = readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...defaults, ...JSON.parse(data) };
}

export function saveSettings(settings: Settings): void {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 4), 'utf-8');
}

