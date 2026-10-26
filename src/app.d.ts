// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Overrides the default <title>, description and social preview image */
			meta?: { title?: string; description?: string; image?: string };
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
