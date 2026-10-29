import { createReadStream, existsSync, mkdirSync, statSync, renameSync, rmSync, openSync, readSync, closeSync } from 'fs';
import { open } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

// Press kit files (built in the ceist-sa/design repo by designs/2026-10-media-kit/build-kit.sh) are uploaded from
// /admin and kept in the data volume, outside git and the Docker image. Their names never change, so links such as
// ceist.pt/imprensa/CEIST-kit-de-comunicacao.zip keep working when a new version is uploaded.
const PRESS_DIR = join(process.cwd(), 'data', 'imprensa');

export const PRESS_FILES = {
    zip: { name: 'CEIST-kit-de-comunicacao.zip', type: 'application/zip', magic: 'PK\x03\x04' },
    pdf: { name: 'CEIST-kit-de-comunicacao.pdf', type: 'application/pdf', magic: '%PDF' }
} as const;

export type PressKind = keyof typeof PRESS_FILES;

export interface PressFile {
    kind: PressKind;
    name: string;
    url: string;
    size: number;
    updatedAt: string;
}

export function isPressKind(value: unknown): value is PressKind {
    return typeof value === 'string' && Object.hasOwn(PRESS_FILES, value);
}

export function pressKindFromName(name: string): PressKind | undefined {
    return (Object.keys(PRESS_FILES) as PressKind[]).find((kind) => PRESS_FILES[kind].name === name);
}

function pressPath(kind: PressKind): string {
    return join(PRESS_DIR, PRESS_FILES[kind].name);
}

export function getPressFile(kind: PressKind): PressFile | null {
    const path = pressPath(kind);
    if (!existsSync(path)) {
        return null;
    }
    const stats = statSync(path);
    return {
        kind,
        name: PRESS_FILES[kind].name,
        url: `/imprensa/${PRESS_FILES[kind].name}`,
        size: stats.size,
        updatedAt: stats.mtime.toISOString()
    };
}

export function getPressFiles(): Record<PressKind, PressFile | null> {
    return { zip: getPressFile('zip'), pdf: getPressFile('pdf') };
}

/** Streams an upload to disk, checks it really is a zip/PDF, then swaps it in atomically. */
export async function savePressFile(kind: PressKind, body: ReadableStream<Uint8Array>): Promise<PressFile> {
    mkdirSync(PRESS_DIR, { recursive: true });
    const tmp = `${pressPath(kind)}.upload`;
    try {
        // Each chunk is written before the next one is read. (Piping Readable.fromWeb into a write stream dropped
        // chunks under Bun when a browser uploaded quickly.)
        const file = await open(tmp, 'w');
        try {
            const reader = body.getReader();
            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                await file.write(value);
            }
        } finally {
            await file.close();
        }

        const { magic } = PRESS_FILES[kind];
        const head = Buffer.alloc(magic.length);
        const fd = openSync(tmp, 'r');
        readSync(fd, head, 0, magic.length, 0);
        closeSync(fd);
        if (head.toString('latin1') !== magic) {
            throw new Error(`Not a valid ${kind.toUpperCase()} file`);
        }

        renameSync(tmp, pressPath(kind));
    } finally {
        rmSync(tmp, { force: true });
    }
    return getPressFile(kind)!;
}

export function deletePressFile(kind: PressKind): void {
    rmSync(pressPath(kind), { force: true });
}

export function openPressFile(kind: PressKind): ReadableStream<Uint8Array> {
    return Readable.toWeb(createReadStream(pressPath(kind))) as ReadableStream<Uint8Array>;
}
