<script lang="ts">
    import type { NewsItem } from "$lib/data/news";

    interface Props {
        concerts: NewsItem[];
    }

    let { concerts }: Props = $props();

    function getMonthDay(dateStr: string): { month: string; day: string } {
        const date = new Date(dateStr);
        return {
            month: date
                .toLocaleDateString("pt-PT", { month: "short" })
                .toUpperCase(),
            day: date.getDate().toString(),
        };
    }
</script>

{#if concerts.length > 0}
    <section id="news" class="py-24 max-md:py-16">
        <div class="max-w-5xl mx-auto px-8">
            <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] text-center mb-8">
                Próximos Concertos
            </h2>
            <p class="text-center opacity-80 max-w-[50ch] mx-auto mb-16">
                Descubra os nossos próximos espetáculos
            </p>

            <div
                class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8"
            >
                {#each concerts as item (item.id)}
                    {@const dateInfo = getMonthDay(item.date)}
                    <article
                        class="flex gap-8 p-8 bg-paper border border-ink/10 rounded-lg transition-all duration-300
                            hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(40,40,40,0.1)] hover:border-ink/20
                            max-[480px]:flex-col"
                    >
                        <div
                            class="shrink-0 flex flex-col items-center justify-center w-[70px] h-[70px] bg-ink text-paper rounded-lg
                          max-[480px]:w-full max-[480px]:h-auto max-[480px]:flex-row max-[480px]:gap-2 max-[480px]:py-4"
                        >
                            <span
                                class="font-lora text-3xl font-bold leading-none max-[480px]:text-2xl"
                                >{dateInfo.day}</span
                            >
                            <span class="font-gill text-[0.7rem]"
                                >{dateInfo.month}</span
                            >
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-lora font-bold text-xl mb-2">
                                {item.title}
                            </h3>
                            <div
                                class="flex flex-wrap gap-2 text-sm opacity-70 mb-2"
                            >
                                <span class="flex items-center gap-1.5 mr-2">
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
                                        class="shrink-0"
                                    >
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {item.time}
                                </span>
                                <span class="flex items-center gap-1.5">
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
                                        class="shrink-0"
                                    >
                                        <path
                                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                        />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {item.location}
                                </span>
                            </div>
                            <p class="text-[0.95rem] opacity-85">
                                {item.description}
                            </p>
                        </div>
                    </article>
                {/each}
            </div>
        </div>
    </section>
{/if}
