<script lang="ts">
    import { onMount } from "svelte";
    import type { NewsItem } from "$lib/data/news";

    interface Props {
        concerts?: NewsItem[];
    }

    interface MusicSymbol {
        glyph: string;
        /** Position inside the hero, as CSS lengths */
        top: string;
        left: string;
        /** Font size, as a CSS length */
        size: string;
        color: string;
        /** How strongly the symbol reacts to the mouse (parallax depth) */
        depth: number;
        /** Float animation duration and offset, in seconds */
        duration: number;
        delay: number;
        /** Hide on small screens, where it would overlap the logo */
        desktopOnly?: boolean;
    }

    const symbols: MusicSymbol[] = [
        { glyph: "𝄞", top: "20%", left: "8%", size: "clamp(2.75rem, 4.5vw, 4.25rem)", color: "text-accent-sky", depth: 1.6, duration: 9, delay: 0 },
        { glyph: "♪", top: "14%", left: "25%", size: "3rem", color: "text-accent-sage", depth: 0.8, duration: 7, delay: -2, desktopOnly: true },
        { glyph: "♫", top: "58%", left: "6%", size: "clamp(2.5rem, 5vw, 3.75rem)", color: "text-accent-rose", depth: 1.2, duration: 8, delay: -4 },
        { glyph: "♩", top: "44%", left: "22%", size: "3.25rem", color: "text-accent-gold", depth: 0.5, duration: 6, delay: -1, desktopOnly: true },
        { glyph: "♭", top: "82%", left: "16%", size: "3.5rem", color: "text-accent-gold", depth: 0.9, duration: 7.5, delay: -3, desktopOnly: true },
        { glyph: "𝄢", top: "28%", left: "86%", size: "clamp(2.75rem, 5.5vw, 4.5rem)", color: "text-accent-rose", depth: 1.4, duration: 10, delay: -5 },
        { glyph: "♬", top: "14%", left: "73%", size: "3.25rem", color: "text-accent-sky", depth: 0.7, duration: 8.5, delay: -6, desktopOnly: true },
        { glyph: "♯", top: "74%", left: "91%", size: "clamp(3rem, 5vw, 4rem)", color: "text-accent-sage", depth: 1.1, duration: 6.5, delay: -2.5 },
        { glyph: "♮", top: "82%", left: "78%", size: "3.25rem", color: "text-accent-rose", depth: 0.6, duration: 7, delay: -1.5, desktopOnly: true },
    ];

    let { concerts = [] }: Props = $props();
    let visible = $state(false);
    let mouseX = $state(0);
    let mouseY = $state(0);
    let reduceMotion = false;

    function handleMouseMove(event: MouseEvent) {
        if (reduceMotion) return;
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    }

    onMount(() => {
        reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        visible = true;
    });
</script>

<svelte:window onmousemove={handleMouseMove} />

<section
    id="hero"
    class="min-h-screen flex items-center justify-center relative overflow-hidden pt-header bg-paper"
>
    <!-- Background Decorations -->
    <div
        aria-hidden="true"
        class="absolute inset-0 z-0 pointer-events-none select-none"
        style="mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);"
    >
        <!-- Glow Blobs -->
        <div
            class="absolute -top-24 -left-24 w-[500px] h-[500px] bg-accent-sky/20 rounded-full blur-[120px] animate-pulse-slow"
        ></div>
        <div
            class="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-accent-rose/15 rounded-full blur-[150px] animate-pulse-slower"
        ></div>
        <div
            class="absolute bottom-12 left-1/4 w-[400px] h-[400px] bg-accent-gold/20 rounded-full blur-[100px] animate-pulse-slow"
        ></div>

        <!-- Floating Musical Symbols -->
        {#each symbols as symbol, i}
            <div
                class="absolute -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] ease-out
                    {symbol.desktopOnly ? 'max-md:hidden' : ''}
                    {visible ? 'opacity-100' : 'opacity-0'}"
                style="top: {symbol.top}; left: {symbol.left}; transform: translate({mouseX *
                    symbol.depth *
                    -40}px, {mouseY * symbol.depth * -40}px);
                    transition-duration: 1200ms, 600ms; transition-delay: {300 +
                    i * 120}ms, 0ms;"
            >
                <span
                    class="block font-music leading-none animate-sway {symbol.color}"
                    style="font-size: {symbol.size}; animation-duration: {symbol.duration}s; animation-delay: {symbol.delay}s;"
                >
                    {symbol.glyph}
                </span>
            </div>
        {/each}
    </div>

    <div
        class="text-center z-10 p-8 transition-all duration-800 ease-out {visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'}"
        style="transform: translate({mouseX * 30}px, {mouseY * 30}px)"
    >
        <div class="mb-16">
            <img
                src="/logo.svg"
                alt="CEIST Logo"
                class="h-[clamp(200px,35vh,300px)] w-auto mx-auto max-md:h-[clamp(150px,30vh,200px)] drop-shadow-sm"
            />
        </div>
        <h1 class="mb-4">
            <img
                src="/name.svg"
                alt="Camerata de Estudantes do Instituto Superior Técnico"
                class="h-[clamp(60px,10vw,100px)] w-auto mx-auto max-md:h-[clamp(40px,8vw,60px)] mb-20 drop-shadow-sm"
            />
        </h1>
        {#if concerts.length > 0}
            <a
                href="#news"
                class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
                 border-2 border-current bg-transparent cursor-pointer transition-all duration-300
                 hover:bg-ink hover:text-paper animate-[pulse-gentle_2s_ease-in-out_infinite]
                 backdrop-blur-sm"
            >
                Próximos Concertos
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
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
            </a>
        {/if}
    </div>
</section>

<style>
    @keyframes pulse-slow {
        0%,
        100% {
            opacity: 0.4;
            transform: scale(1) translate(0, 0);
        }
        50% {
            opacity: 0.7;
            transform: scale(1.1) translate(20px, -20px);
        }
    }

    @keyframes pulse-slower {
        0%,
        100% {
            opacity: 0.3;
            transform: scale(1) translate(0, 0);
        }
        50% {
            opacity: 0.6;
            transform: scale(1.2) translate(-30px, 20px);
        }
    }

    .animate-pulse-slow {
        animation: pulse-slow 15s ease-in-out infinite;
    }

    .animate-pulse-slower {
        animation: pulse-slower 20s ease-in-out infinite;
    }

    .animate-sway {
        animation: sway 8s ease-in-out infinite;
    }

    @keyframes sway {
        0%,
        100% {
            transform: translateY(0) rotate(-6deg);
        }
        50% {
            transform: translateY(-18px) rotate(6deg);
        }
    }
</style>
