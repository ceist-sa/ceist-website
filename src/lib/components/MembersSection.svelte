<script lang="ts">
    import type { Section } from "$lib/data/members";

    interface Props {
        sections: Section[];
    }

    let { sections }: Props = $props();
</script>

<section id="members" class="py-24 max-md:py-16 bg-ink text-paper">
    <div class="max-w-450 mx-auto px-8">
        <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] text-center mb-8">
            Os Nossos Músicos
        </h2>
        <p class="text-center opacity-80 max-w-[50ch] mx-auto mb-16">
            Estudantes e alumni do Instituto Superior Técnico unidos pela música
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
    </div>
</section>
