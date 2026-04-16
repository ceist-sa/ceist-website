<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import type { GalleryPhoto } from "$lib/data/gallery";

    interface Props {
        photos?: GalleryPhoto[];
    }

    let { photos = [] }: Props = $props();

    // Number of slots to display
    const SLOT_COUNT = 6;
    // Rotation interval in milliseconds
    const ROTATION_INTERVAL = 10000;
    // Stagger delay between slot switches (in milliseconds)
    const STAGGER_DELAY = 1500;

    // Fallback colors for slots without photos
    const fallbackColors = [
        "bg-accent-rose",
        "bg-accent-gold",
        "bg-accent-sage",
        "bg-accent-sky",
        "bg-accent-rose",
        "bg-accent-gold",
    ];

    // Track which photo index is being shown in each slot
    let slotPhotoIndices = $state<number[]>([]);
    // Track visibility for fade transitions (keyed by slot to force re-render)
    let slotKeys = $state<number[]>([]);
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let keyCounter = 0;

    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get a random index from an array
    function getRandomIndex(max: number): number {
        return Math.floor(Math.random() * max);
    }

    // Initialize slot indices with random photos
    function initializeSlots() {
        if (photos.length === 0) {
            slotPhotoIndices = [];
            slotKeys = [];
            return;
        }

        const slotsToFill = Math.min(SLOT_COUNT, photos.length);
        const indices: number[] = [];
        const keys: number[] = [];

        if (photos.length <= SLOT_COUNT) {
            // If we have fewer or equal photos than slots, shuffle them
            const shuffledIndices = shuffleArray(
                Array.from({ length: photos.length }, (_, i) => i),
            );
            for (let i = 0; i < slotsToFill; i++) {
                indices.push(shuffledIndices[i]);
                keys.push(keyCounter++);
            }
        } else {
            // Pick random unique photos for each slot
            const availableIndices = new Set(
                Array.from({ length: photos.length }, (_, i) => i),
            );
            for (let i = 0; i < slotsToFill; i++) {
                const availableArray = Array.from(availableIndices);
                const randomIdx =
                    availableArray[getRandomIndex(availableArray.length)];
                indices.push(randomIdx);
                keys.push(keyCounter++);
                availableIndices.delete(randomIdx);
            }
        }

        slotPhotoIndices = indices;
        slotKeys = keys;
    }

    // Get a random available photo index that isn't currently shown
    function getRandomAvailableIndex(excludeIndex: number): number {
        if (photos.length <= SLOT_COUNT) {
            // If we have fewer photos than slots, pick any random one different from current
            let newIndex: number;
            do {
                newIndex = getRandomIndex(photos.length);
            } while (newIndex === excludeIndex && photos.length > 1);
            return newIndex;
        }

        // Find photos that aren't currently being displayed
        const displayedIndices = new Set(slotPhotoIndices);
        const availableIndices = Array.from(
            { length: photos.length },
            (_, i) => i,
        ).filter((i) => !displayedIndices.has(i));

        if (availableIndices.length === 0) {
            // Fallback: pick a random one
            return getRandomIndex(photos.length);
        }

        return availableIndices[getRandomIndex(availableIndices.length)];
    }

    // Rotate a specific slot to a new random photo
    function rotateSlot(slotIndex: number) {
        if (photos.length < 2) return;

        const currentIndex = slotPhotoIndices[slotIndex];
        const nextIndex = getRandomAvailableIndex(currentIndex);

        slotPhotoIndices[slotIndex] = nextIndex;
        // Update key to trigger fade transition
        slotKeys[slotIndex] = keyCounter++;
    }

    // Start the rotation timers with random order
    function startRotation() {
        clearTimeouts();

        if (photos.length < 2) return;

        const activeSlotCount = Math.min(SLOT_COUNT, photos.length);

        // Create a shuffled order for the initial rotation
        let slotOrder = shuffleArray(
            Array.from({ length: activeSlotCount }, (_, i) => i),
        );

        // Set up staggered rotation with random slot order
        for (let i = 0; i < activeSlotCount; i++) {
            const slotIndex = slotOrder[i];
            const offset = i * STAGGER_DELAY;

            const setupSlotRotation = (slot: number, initialDelay: number) => {
                const timeout = setTimeout(() => {
                    rotateSlot(slot);

                    // Set up recurring rotation for this slot with random timing
                    const scheduleNextRotation = () => {
                        // Add some random variation to the interval (+/- 20%)
                        const variation =
                            ROTATION_INTERVAL * 0.4 * (Math.random() - 0.5);
                        const nextDelay = ROTATION_INTERVAL + variation;

                        const intervalTimeout = setTimeout(() => {
                            rotateSlot(slot);
                            scheduleNextRotation();
                        }, nextDelay);
                        timeouts.push(intervalTimeout);
                    };

                    scheduleNextRotation();
                }, initialDelay);
                timeouts.push(timeout);
            };

            setupSlotRotation(slotIndex, offset);
        }
    }

    function clearTimeouts() {
        for (const timeout of timeouts) {
            clearTimeout(timeout);
        }
        timeouts = [];
    }

    onMount(() => {
        initializeSlots();
        // Start rotation after a brief delay to let the page settle
        const startTimeout = setTimeout(() => {
            startRotation();
        }, ROTATION_INTERVAL);
        timeouts.push(startTimeout);
    });

    onDestroy(() => {
        clearTimeouts();
    });

    // Re-initialize when photos change
    $effect(() => {
        // Access photos to create dependency
        const _photos = photos;
        initializeSlots();
    });
</script>

<section id="gallery" class="py-24 max-md:py-16">
    <div class="max-w-5xl mx-auto px-8">
        <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] text-center mb-8">
            Galeria
        </h2>
        <p class="text-center opacity-80 max-w-[50ch] mx-auto mb-16">
            Revive os melhores momentos dos nossos concertos e ensaios
        </p>

        <div class="grid grid-cols-3 max-[600px]:grid-cols-2 gap-4 mb-16">
            {#each Array(SLOT_COUNT) as _, i}
                {#if photos.length > 0 && slotPhotoIndices[i] !== undefined}
                    <a
                        href={photos[slotPhotoIndices[i]]?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="aspect-square rounded-lg relative overflow-hidden cursor-pointer group
                        {i >= 4 ? 'max-[600px]:hidden' : ''}"
                    >
                        {#key slotKeys[i]}
                            <img
                                src={photos[slotPhotoIndices[i]]?.url}
                                alt=""
                                class="absolute inset-0 w-full h-full object-cover"
                                in:fade={{ duration: 700 }}
                                out:fade={{ duration: 700 }}
                            />
                        {/key}
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-paper"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    </a>
                {:else}
                    <div
                        class="aspect-square rounded-lg relative overflow-hidden
                        {i >= 4 ? 'max-[600px]:hidden' : ''}
                        {fallbackColors[i]}"
                    >
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-paper"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    </div>
                {/if}
            {/each}
        </div>

        <div class="text-center">
            <a
                href="/galeria"
                class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
               border-2 border-current bg-transparent cursor-pointer transition-all duration-300
               hover:bg-ink hover:text-paper"
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
                Ver Galeria Completa
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
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </a>
        </div>
    </div>
</section>
