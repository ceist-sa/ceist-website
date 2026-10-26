<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import { concertUrl, parseConcertDate } from "$lib/concerts";

    let { data } = $props();
    let concert = $derived(data.concert);

    let fullDate = $derived(
        parseConcertDate(concert.date).toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
    );

    let mapUrl = $derived(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(concert.location)}`,
    );

    let paragraphs = $derived(
        (concert.details ?? "")
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean),
    );

    // "Composer — Work" lines are split so the composer can be styled separately
    let program = $derived(
        (concert.program ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const match = line.match(/^(.+?)\s+[—–-]\s+(.+)$/);
                return match
                    ? { composer: match[1], work: match[2] }
                    : { composer: "", work: line };
            }),
    );

    /** UTC offset of Lisbon on the concert day, e.g. "+01:00" */
    function lisbonOffset(date: string): string {
        const [y, m, d] = date.split("-").map(Number);
        const name = new Intl.DateTimeFormat("en-US", {
            timeZone: "Europe/Lisbon",
            timeZoneName: "longOffset",
        })
            .formatToParts(new Date(Date.UTC(y, m - 1, d, 12)))
            .find((p) => p.type === "timeZoneName")?.value;
        return name?.replace("GMT", "") || "+00:00";
    }

    // Structured data so search engines can show the concert as an event
    let jsonLd = $derived(
        JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicEvent",
            name: concert.title,
            description: concert.description,
            startDate: concert.time
                ? `${concert.date}T${concert.time}:00${lisbonOffset(concert.date)}`
                : concert.date,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
                "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: concert.location, address: concert.location },
            ...(concert.imageUrl && { image: [concert.imageUrl] }),
            ...(concert.ticketUrl && {
                offers: { "@type": "Offer", url: concert.ticketUrl },
            }),
            performer: {
                "@type": "MusicGroup",
                name: "CEIST — Camerata de Estudantes do Instituto Superior Técnico",
            },
            organizer: { "@type": "Organization", name: "CEIST", url: "https://ceist.pt" },
        }).replace(/</g, "\\u003c"),
    );
</script>

<svelte:head>
    {@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<article class="pt-header">
    <div class="max-w-5xl mx-auto px-8 py-16 max-md:py-12">
        <a
            href="/#news"
            class="inline-flex items-center gap-2 font-gill text-sm uppercase opacity-70 hover:opacity-100 transition-opacity mb-12"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Concertos
        </a>

        {#if !data.upcoming}
            <p
                class="mb-8 px-5 py-4 border border-ink/15 rounded-lg bg-ink/5 text-[0.95rem]"
            >
                Este concerto já aconteceu.
                <a href="/#news" class="underline underline-offset-4"
                    >Vê os próximos concertos</a
                >.
            </p>
        {/if}

        <div
            class="grid gap-12 {concert.imageUrl
                ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]'
                : ''}"
        >
            <div class="min-w-0">
                <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-tight mb-6">
                    {concert.title}
                </h1>
                {#if concert.description}
                    <p class="text-lg opacity-85 max-w-[60ch] mb-10">
                        {concert.description}
                    </p>
                {/if}

                <dl
                    class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 py-8 border-y border-ink/10 mb-10"
                >
                    <dt class="font-gill text-sm uppercase opacity-60 pt-0.5">
                        Data
                    </dt>
                    <dd class="first-letter:uppercase">{fullDate}</dd>

                    {#if concert.time}
                        <dt
                            class="font-gill text-sm uppercase opacity-60 pt-0.5"
                        >
                            Hora
                        </dt>
                        <dd>{concert.time}</dd>
                    {/if}

                    <dt class="font-gill text-sm uppercase opacity-60 pt-0.5">
                        Local
                    </dt>
                    <dd>
                        {concert.location}
                        <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-block whitespace-nowrap ml-2 text-sm opacity-70 underline underline-offset-4 hover:opacity-100 transition-opacity"
                            >Ver no mapa</a
                        >
                    </dd>

                    {#if concert.price}
                        <dt
                            class="font-gill text-sm uppercase opacity-60 pt-0.5"
                        >
                            Entrada
                        </dt>
                        <dd>{concert.price}</dd>
                    {/if}
                </dl>

                {#if data.upcoming}
                    <div class="flex flex-wrap gap-4 mb-12">
                        {#if concert.ticketUrl}
                            <a
                                href={concert.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                                 border-2 border-ink bg-ink text-paper transition-all duration-300
                                 hover:bg-transparent hover:text-ink"
                            >
                                Bilhetes
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        {/if}
                        <a
                            href="{concertUrl(concert)}/calendario.ics"
                            download
                            data-sveltekit-reload
                            class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                             border-2 border-current bg-transparent transition-all duration-300
                             hover:bg-ink hover:text-paper"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
                            </svg>
                            Adicionar ao Calendário
                        </a>
                    </div>
                {/if}

                {#if paragraphs.length > 0}
                    <div class="space-y-4 max-w-[65ch] mb-12">
                        {#each paragraphs as paragraph}
                            <p class="whitespace-pre-line">{paragraph}</p>
                        {/each}
                    </div>
                {/if}

                {#if program.length > 0}
                    <section>
                        <h2 class="text-2xl mb-6">Programa</h2>
                        <ol class="divide-y divide-ink/10 border-y border-ink/10">
                            {#each program as piece}
                                <li class="py-4">
                                    {#if piece.composer}
                                        <span
                                            class="block font-gill text-sm uppercase opacity-60 mb-1"
                                            >{piece.composer}</span
                                        >
                                    {/if}
                                    <span class="italic">{piece.work}</span>
                                </li>
                            {/each}
                        </ol>
                    </section>
                {/if}
            </div>

            {#if concert.imageUrl}
                <div>
                    <img
                        src={concert.imageUrl}
                        alt="Cartaz do concerto {concert.title}"
                        class="w-full rounded-lg shadow-lg shadow-ink/10 md:sticky md:top-[calc(var(--spacing-header)+2rem)]"
                    />
                </div>
            {/if}
        </div>
    </div>
</article>

<Footer />
