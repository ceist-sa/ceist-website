<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";

    let { data } = $props();
    let zip = $derived(data.files.zip);
    let pdf = $derived(data.files.pdf);
    let updatedAt = $derived(zip?.updatedAt ?? pdf?.updatedAt);

    function formatSize(bytes: number): string {
        return bytes >= 1e6
            ? `${Math.round(bytes / 1e6)} MB`
            : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
    }

    function formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }
</script>

<section class="pt-header">
    <div class="max-w-5xl mx-auto px-8 py-16 max-md:py-12">
        <p class="font-gill text-sm uppercase opacity-60 mb-4">Imprensa</p>
        <h1 class="text-[clamp(2rem,5vw,3.25rem)] leading-tight mb-6">
            Kit de comunicação
        </h1>
        <p class="text-lg opacity-85 max-w-[60ch] mb-10">
            Para salas de concerto, parceiros e imprensa: o nosso guia de
            comunicação, logótipos, textos de apresentação e fotografias
            recentes, tudo o que é preciso para divulgar um concerto da CEIST.
        </p>

        {#if zip || pdf}
            <div class="flex flex-wrap gap-4 mb-4">
                {#if zip}
                    <a
                        href={zip.url}
                        download
                        data-sveltekit-reload
                        class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                         border-2 border-ink bg-ink text-paper transition-all duration-300
                         hover:bg-transparent hover:text-ink"
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
                            <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                        </svg>
                        Descarregar o kit
                        <span class="opacity-60 normal-case whitespace-nowrap">(zip, {formatSize(zip.size)})</span>
                    </a>
                {/if}
                {#if pdf}
                    <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener"
                        data-sveltekit-reload
                        class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                         border-2 border-current bg-transparent transition-all duration-300
                         hover:bg-ink hover:text-paper"
                    >
                        Ver só o guia
                        <span class="opacity-60 normal-case whitespace-nowrap">(PDF, {formatSize(pdf.size)})</span>
                    </a>
                {/if}
            </div>
            {#if updatedAt}
                <p class="text-sm opacity-60 mb-12">
                    Atualizado a {formatDate(updatedAt)}.
                </p>
            {/if}
        {:else}
            <p
                class="mb-12 px-5 py-4 border border-ink/15 rounded-lg bg-ink/5 text-[0.95rem] max-w-[60ch]"
            >
                O kit estará disponível em breve. Entretanto, escrevam-nos para
                <a href="mailto:contacto@ceist.pt" class="underline underline-offset-4"
                    >contacto@ceist.pt</a
                >.
            </p>
        {/if}

        <div class="grid md:grid-cols-2 gap-12 py-10 border-y border-ink/10 mb-12">
            <div>
                <h2 class="text-2xl mb-4">O que inclui</h2>
                <ul class="space-y-2 opacity-85">
                    <li>Guia de comunicação (PDF)</li>
                    <li>Logótipos da CEIST em SVG e PNG, versões clara e escura</li>
                    <li>Logótipos da AEIST e do Técnico</li>
                    <li>Textos de apresentação, prontos a copiar</li>
                    <li>Fotografias recentes da orquestra e dos Solistas da CEIST</li>
                </ul>
            </div>
            <div>
                <h2 class="text-2xl mb-4">Dois formatos de concerto</h2>
                <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                    <dt class="font-gill text-sm uppercase opacity-60 pt-0.5">Orquestra</dt>
                    <dd>
                        A orquestra completa. Cada concerto tem nome próprio:
                        Concerto de Natal, Concerto de Páscoa…
                    </dd>
                    <dt class="font-gill text-sm uppercase opacity-60 pt-0.5">Solistas</dt>
                    <dd>
                        <strong class="font-bold">Solistas da CEIST</strong>: pequenos
                        grupos de câmara, como duos, trios e quartetos.
                    </dd>
                </dl>
                <p class="mt-4 text-sm opacity-70">
                    Nunca anunciem um concerto só como «Concerto».
                </p>
            </div>
        </div>

        <p class="max-w-[60ch]">
            Para cada concerto enviamos também cartazes e publicações prontos a
            usar. Se fizerem material próprio, enviem-nos uma prova para
            <a href="mailto:contacto@ceist.pt" class="underline underline-offset-4"
                >contacto@ceist.pt</a
            > antes de publicar.
        </p>
    </div>
</section>

<Footer />
