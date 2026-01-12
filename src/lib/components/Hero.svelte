<script lang="ts">
    import { onMount } from "svelte";
    import type { NewsItem } from "$lib/data/news";

    interface Props {
        concerts?: NewsItem[];
    }

    let { concerts = [] }: Props = $props();
    let visible = $state(false);
    let mouseX = $state(0);
    let mouseY = $state(0);

    function handleMouseMove(event: MouseEvent) {
        mouseX = event.clientX / window.innerWidth - 0.5;
        mouseY = event.clientY / window.innerHeight - 0.5;
    }

    onMount(() => {
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
        role="presentation"
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

        <!-- Floating Decorative Elements (Small Dots/Notes style) -->
        <div
            class="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-accent-sage animate-float"
        ></div>
        <div
            class="absolute top-[60%] left-[10%] w-3 h-3 rounded-full bg-accent-sky animate-float-delayed"
        ></div>
        <div
            class="absolute bottom-[20%] right-[25%] w-2 h-2 rounded-full bg-accent-gold animate-float"
        ></div>
        <div
            class="absolute top-[30%] right-[15%] w-4 h-4 rounded-full bg-accent-rose animate-float-delayed"
        ></div>
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

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    .animate-float-delayed {
        animation: float 8s ease-in-out infinite 2s;
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0) translateX(0);
        }
        50% {
            transform: translateY(-20px) translateX(10px);
        }
    }
</style>
