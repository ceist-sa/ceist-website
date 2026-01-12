<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { data } = $props();

    afterNavigate(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    });
</script>

<svelte:head>
    <title>Galeria — CEIST</title>
    <meta
        name="description"
        content="Explore os álbuns de fotos da CEIST - Camerata de Estudantes do Instituto Superior Técnico"
    />
</svelte:head>

<Header />

<main class="min-h-screen bg-paper pt-header">
    <!-- Hero Section -->
    <section class="py-16 md:py-24 text-center">
        <div class="max-w-4xl mx-auto px-8">
            <h1 class="text-[clamp(2rem,5vw,3.5rem)] mb-6">Galeria</h1>
            <p class="text-lg opacity-80 max-w-[55ch] mx-auto">
                Explore os melhores momentos dos nossos concertos, ensaios e
                eventos através dos nossos álbuns de fotos.
            </p>
        </div>
    </section>

    <!-- Albums Grid -->
    <section class="pb-24 md:pb-32">
        <div class="max-w-6xl mx-auto px-8">
            {#if data.albums.length === 0}
                <div
                    class="text-center py-16 bg-ink/5 rounded-2xl border border-ink/10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="mx-auto mb-6 opacity-30"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p class="text-lg opacity-60">
                        Ainda não existem álbuns disponíveis.
                    </p>
                    <p class="text-sm opacity-40 mt-2">
                        Volte em breve para ver as nossas fotos!
                    </p>
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                    {#each data.albums as album (album.id)}
                        <a
                            href={album.albumUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group block"
                        >
                            <article
                                class="bg-paper rounded-2xl overflow-hidden shadow-lg shadow-ink/5 border border-ink/5 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-ink/10 group-hover:-translate-y-1"
                            >
                                <div
                                    class="aspect-4/3 relative overflow-hidden"
                                >
                                    <img
                                        src={album.coverUrl}
                                        alt=""
                                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div
                                        class="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    ></div>
                                    <div
                                        class="absolute bottom-4 right-4 bg-paper/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        >
                                            <path
                                                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                            ></path>
                                            <polyline points="15 3 21 3 21 9"
                                            ></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"
                                            ></line>
                                        </svg>
                                    </div>
                                </div>
                                <div class="p-5">
                                    <h2
                                        class="font-gill text-lg md:text-xl group-hover:text-accent-gold transition-colors duration-300"
                                    >
                                        {album.title}
                                    </h2>
                                    {#if album.date || album.location}
                                        <p class="text-sm opacity-70 mt-1">
                                            {#if album.date && album.location}
                                                {album.date} · {album.location}
                                            {:else}
                                                {album.date || album.location}
                                            {/if}
                                        </p>
                                    {/if}
                                </div>
                            </article>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </section>

    <!-- Back to Home -->
    <section class="pb-16">
        <div class="text-center">
            <a
                href="/"
                class="inline-flex items-center gap-2 px-6 py-3 font-gill text-sm uppercase border-2 hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300"
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
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Voltar à Página Inicial
            </a>
        </div>
    </section>
</main>

<Footer />
