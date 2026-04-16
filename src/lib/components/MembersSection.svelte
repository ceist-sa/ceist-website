<script lang="ts">
    import type { Section } from "$lib/data/members";

    interface Props {
        sections: Section[];
        joinFormUrl?: string;
    }

    let { sections, joinFormUrl = "" }: Props = $props();
</script>

<section id="members" class="py-24 max-md:py-16 bg-ink text-paper">
    <div class="max-w-450 mx-auto px-8">
        <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] text-center mb-8">
            Os Nossos Músicos
        </h2>
        <p class="text-center opacity-80 max-w-[50ch] mx-auto mb-16">
            Estudantes e alumni unidos pela música
        </p>

        <div
            class="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-8 space-y-8"
        >
            {#each sections as section}
                <div
                    class="p-8 bg-paper/5 border border-paper/10 rounded-lg transition-all duration-300 hover:bg-paper/10 hover:border-paper/20 max-h-[600px] overflow-hidden break-inside-avoid mb-8 inline-block w-full"
                >
                    <h4
                        class="font-gill uppercase text-sm mb-4 pb-2 border-b border-paper/20"
                    >
                        {section.name}
                    </h4>
                    <ul class="columns-1 sm:columns-2 gap-4">
                        {#each section.members as member}
                            <li
                                class="flex flex-col gap-0.5 break-inside-avoid mb-4"
                            >
                                <span class="text-[0.95rem] font-medium"
                                    >{member.name}</span
                                >
                                {#if member.role}
                                    <span
                                        class="font-gill text-xs uppercase text-accent-gold"
                                    >
                                        {member.role}
                                    </span>
                                {/if}
                                {#if member.degree}
                                    <span class="text-sm opacity-60 italic"
                                        >{member.degree}</span
                                    >
                                {/if}
                            </li>
                        {/each}
                    </ul>
                </div>
            {/each}
        </div>

        {#if joinFormUrl}
            <div id="join" class="mt-16 pt-16 border-t border-paper/10 text-center">
                <h3 class="text-[clamp(1.25rem,3vw,1.75rem)] mb-4">
                    Junta-te a Nós
                </h3>
                <p class="max-w-[50ch] mx-auto opacity-80 mb-8">
                    Queres vir tocar connosco?<br />Candidata-te para fazeres parte da orquestra.
                </p>
                <a
                    href={joinFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                     border-2 border-paper bg-transparent transition-all duration-300
                     hover:bg-paper hover:text-ink"
                >
                    Inscrição
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
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </a>
            </div>
        {/if}
    </div>
</section>
