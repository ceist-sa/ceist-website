<script lang="ts">
    import { onMount } from "svelte";
    import {
        GripVertical,
        Pencil,
        Trash2,
        UserPlus,
        ExternalLink,
    } from "@lucide/svelte";
    import { concertUrl, isUpcoming } from "$lib/concerts";
    import type { NewsItem } from "$lib/data/news";
    import type { Section, Member } from "$lib/data/members";
    import type { GalleryPhoto } from "$lib/data/gallery";

    let activeTab = $state<"concerts" | "members" | "gallery" | "press">(
        "concerts",
    );

    // Concerts state
    let concerts = $state<NewsItem[]>([]);
    let editingConcert = $state<NewsItem | null>(null);
    let isAddingConcert = $state(false);
    let concertForm = $state<Partial<NewsItem>>({});

    // Members state
    let sections = $state<Section[]>([]);
    let editingMember = $state<{
        sectionIndex: number;
        memberIndex: number;
    } | null>(null);
    let editingSection = $state<number | null>(null);
    let isAddingMember = $state<number | null>(null);
    let isAddingSection = $state(false);
    let memberForm = $state<Partial<Member>>({});
    let sectionNameForm = $state("");
    let newSectionName = $state("");

    // Drag and drop state
    let draggedSectionIndex = $state<number | null>(null);
    let dragOverSectionIndex = $state<number | null>(null);

    // Gallery state
    let galleryPreview = $state<GalleryPhoto[]>([]);
    let galleryPreviewLoading = $state(false);

    // Press kit state (files served at /imprensa, see src/lib/server/press.ts)
    type PressKind = "zip" | "pdf";
    type PressFile = { name: string; url: string; size: number; updatedAt: string };
    const pressSlots: { kind: PressKind; label: string; accept: string; hint: string }[] = [
        {
            kind: "zip",
            label: "Full kit (.zip)",
            accept: ".zip,application/zip",
            hint: "Guide, logos, texts and photos.",
        },
        {
            kind: "pdf",
            label: "Guide only (.pdf)",
            accept: ".pdf,application/pdf",
            hint: "The same PDF that is inside the zip.",
        },
    ];
    let pressFiles = $state<Record<PressKind, PressFile | null>>({
        zip: null,
        pdf: null,
    });
    let pressUploading = $state<PressKind | null>(null);
    let pressProgress = $state(0);
    let pressError = $state("");

    // Settings state
    let joinFormUrl = $state("");
    let galleryAlbumUrl = $state("");

    // Loading/saving state
    let loading = $state(true);
    let saveMessage = $state("");

    onMount(() => {
        loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [concertsRes, membersRes, settingsRes, pressRes] =
                await Promise.all([
                    fetch("/api/concerts"),
                    fetch("/api/members"),
                    fetch("/api/settings"),
                    fetch("/api/press"),
                ]);
            concerts = await concertsRes.json();
            sections = await membersRes.json();
            const settings = await settingsRes.json();
            joinFormUrl = settings.joinFormUrl ?? "";
            galleryAlbumUrl = settings.galleryAlbumUrl ?? "";
            pressFiles = await pressRes.json();
            sortMembers();
            loadGalleryPreview();
        } finally {
            loading = false;
        }
    }

    async function saveJoinFormUrl() {
        const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ joinFormUrl }),
        });
        if (response.ok) {
            showMessage("Settings saved");
        }
    }

    async function saveGalleryAlbumUrl() {
        const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ galleryAlbumUrl: galleryAlbumUrl.trim() }),
        });
        if (response.ok) {
            showMessage("Settings saved");
            loadGalleryPreview();
        }
    }

    async function loadGalleryPreview() {
        galleryPreviewLoading = true;
        try {
            const response = await fetch("/api/gallery");
            galleryPreview = response.ok ? await response.json() : [];
        } finally {
            galleryPreviewLoading = false;
        }
    }

    // XMLHttpRequest rather than fetch, to show upload progress for the large zip
    function uploadPressFile(kind: PressKind, event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        input.value = "";
        if (!file) return;

        pressError = "";
        pressUploading = kind;
        pressProgress = 0;
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", `/api/press?kind=${kind}`);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) pressProgress = e.loaded / e.total;
        };
        xhr.onload = () => {
            pressUploading = null;
            if (xhr.status >= 200 && xhr.status < 300) {
                pressFiles[kind] = JSON.parse(xhr.responseText);
                showMessage("File uploaded");
            } else {
                let message = xhr.statusText;
                try {
                    message = JSON.parse(xhr.responseText).message ?? message;
                } catch {}
                pressError = `Upload failed: ${message || xhr.status}`;
            }
        };
        xhr.onerror = () => {
            pressUploading = null;
            pressError = "Upload failed: network error";
        };
        xhr.send(file);
    }

    async function deletePressFile(kind: PressKind) {
        if (!confirm("Remove this file from the website?")) return;
        const response = await fetch(`/api/press?kind=${kind}`, {
            method: "DELETE",
        });
        if (response.ok) {
            pressFiles[kind] = null;
            showMessage("File removed");
        }
    }

    function formatSize(bytes: number): string {
        return bytes >= 1e6
            ? `${(bytes / 1e6).toFixed(1)} MB`
            : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
    }

    function showMessage(msg: string) {
        saveMessage = msg;
        setTimeout(() => (saveMessage = ""), 3000);
    }

    // Concert CRUD
    async function saveConcert() {
        if (isAddingConcert) {
            const response = await fetch("/api/concerts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(concertForm),
            });
            if (response.ok) {
                const newConcert = await response.json();
                concerts = [...concerts, newConcert];
                showMessage("Concert added successfully");
            }
        } else if (editingConcert) {
            const response = await fetch("/api/concerts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editingConcert, ...concertForm }),
            });
            if (response.ok) {
                const updated = await response.json();
                concerts = concerts.map((c) =>
                    c.id === updated.id ? updated : c,
                );
                showMessage("Concert updated successfully");
            }
        }
        cancelConcertEdit();
    }

    async function deleteConcert(id: string) {
        if (!confirm("Are you sure you want to delete this concert?")) return;

        const response = await fetch("/api/concerts", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (response.ok) {
            concerts = concerts.filter((c) => c.id !== id);
            showMessage("Concert deleted");
        }
    }

    function startEditConcert(concert: NewsItem) {
        editingConcert = concert;
        concertForm = { ...concert };
        isAddingConcert = false;
    }

    function startAddConcert() {
        isAddingConcert = true;
        editingConcert = null;
        concertForm = {
            date: "",
            time: "",
            title: "",
            location: "",
            description: "",
        };
    }

    function cancelConcertEdit() {
        editingConcert = null;
        isAddingConcert = false;
        concertForm = {};
    }

    // Members CRUD - saves to server immediately
    async function saveMembersToServer() {
        const response = await fetch("/api/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sections),
        });
        return response.ok;
    }

    function sortMembers() {
        sections = sections.map((section) => ({
            ...section,
            members: section.members.toSorted((a: Member, b: Member) =>
                a.name.localeCompare(b.name),
            ),
        }));
    }

    function startEditMember(sectionIndex: number, memberIndex: number) {
        editingMember = { sectionIndex, memberIndex };
        memberForm = { ...sections[sectionIndex].members[memberIndex] };
    }

    async function saveMemberEdit() {
        if (editingMember) {
            sections[editingMember.sectionIndex].members[
                editingMember.memberIndex
            ] = {
                name: memberForm.name || "",
                role: memberForm.role,
                degree: memberForm.degree,
            };
            sortMembers();
            if (await saveMembersToServer()) {
                showMessage("Member updated");
            }
            editingMember = null;
            memberForm = {};
        }
    }

    function startAddMember(sectionIndex: number) {
        isAddingMember = sectionIndex;
        memberForm = { name: "", role: "", degree: "" };
    }

    async function addMember() {
        if (isAddingMember !== null && memberForm.name) {
            sections[isAddingMember].members.push({
                name: memberForm.name,
                role: memberForm.role,
                degree: memberForm.degree,
            });
            sortMembers();
            if (await saveMembersToServer()) {
                showMessage("Member added");
            }
            isAddingMember = null;
            memberForm = {};
        }
    }

    async function deleteMember(sectionIndex: number, memberIndex: number) {
        if (!confirm("Are you sure you want to remove this member?")) return;
        sections[sectionIndex].members.splice(memberIndex, 1);
        sortMembers();
        if (await saveMembersToServer()) {
            showMessage("Member removed");
        }
    }

    function startAddSection() {
        isAddingSection = true;
        newSectionName = "";
    }

    async function addSection() {
        if (newSectionName.trim()) {
            sections = [
                ...sections,
                { name: newSectionName.trim(), members: [] },
            ];
            if (await saveMembersToServer()) {
                showMessage("Section added");
            }
            isAddingSection = false;
            newSectionName = "";
        }
    }

    async function deleteSection(sectionIndex: number) {
        if (
            !confirm(
                "Are you sure you want to delete this section and all its members?",
            )
        )
            return;
        sections.splice(sectionIndex, 1);
        sections = [...sections];
        if (await saveMembersToServer()) {
            showMessage("Section deleted");
        }
    }

    function cancelMemberEdit() {
        editingMember = null;
        isAddingMember = null;
        memberForm = {};
    }

    function startEditSection(sectionIndex: number) {
        editingSection = sectionIndex;
        sectionNameForm = sections[sectionIndex].name;
    }

    async function saveSectionName() {
        if (editingSection !== null && sectionNameForm.trim()) {
            sections[editingSection].name = sectionNameForm.trim();
            sections = [...sections];
            if (await saveMembersToServer()) {
                showMessage("Section renamed");
            }
            editingSection = null;
            sectionNameForm = "";
        }
    }

    function cancelSectionEdit() {
        editingSection = null;
        sectionNameForm = "";
    }

    // Section drag and drop handlers
    function handleSectionDragStart(index: number) {
        draggedSectionIndex = index;
    }

    function handleSectionDragOver(event: DragEvent, index: number) {
        event.preventDefault();
        if (draggedSectionIndex === null || draggedSectionIndex === index) {
            dragOverSectionIndex = null;
            return;
        }
        dragOverSectionIndex = index;
    }

    async function handleSectionDrop(event: DragEvent, dropIndex: number) {
        event.preventDefault();
        if (draggedSectionIndex === null || draggedSectionIndex === dropIndex)
            return;

        const newSections = [...sections];
        const [draggedSection] = newSections.splice(draggedSectionIndex, 1);

        const adjustedDropIndex =
            dropIndex > draggedSectionIndex ? dropIndex - 1 : dropIndex;
        newSections.splice(adjustedDropIndex, 0, draggedSection);
        sections = newSections;

        if (await saveMembersToServer()) {
            showMessage("Section moved");
        }

        draggedSectionIndex = null;
        dragOverSectionIndex = null;
    }
</script>

<svelte:head>
    <title>Admin — CEIST</title>
    <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-ink text-paper">
    <!-- Admin Dashboard -->
    <div class="max-w-6xl mx-auto px-4 py-8">
        <header class="flex items-center justify-between mb-8">
            <h1 class="font-gill text-3xl">CEIST Admin</h1>
            <a
                href="/"
                class="text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
                ← Back to website
            </a>
        </header>

        <!-- Save Message -->
        {#if saveMessage}
            <div
                class="fixed top-4 right-4 bg-accent-sage text-ink px-4 py-2 rounded-lg font-gill z-50 animate-pulse"
            >
                {saveMessage}
            </div>
        {/if}

        <!-- Tabs -->
        <div class="flex gap-4 mb-6 border-b border-paper/20">
            <button
                onclick={() => (activeTab = "concerts")}
                class="pb-3 px-2 font-gill transition-all {activeTab ===
                'concerts'
                    ? 'border-b-2 border-accent-gold text-accent-gold'
                    : 'opacity-60 hover:opacity-100'}"
            >
                Concerts
            </button>
            <button
                onclick={() => (activeTab = "members")}
                class="pb-3 px-2 font-gill transition-all {activeTab ===
                'members'
                    ? 'border-b-2 border-accent-gold text-accent-gold'
                    : 'opacity-60 hover:opacity-100'}"
            >
                Members
            </button>
            <button
                onclick={() => (activeTab = "gallery")}
                class="pb-3 px-2 font-gill transition-all {activeTab ===
                'gallery'
                    ? 'border-b-2 border-accent-gold text-accent-gold'
                    : 'opacity-60 hover:opacity-100'}"
            >
                Gallery
            </button>
            <button
                onclick={() => (activeTab = "press")}
                class="pb-3 px-2 font-gill transition-all {activeTab ===
                'press'
                    ? 'border-b-2 border-accent-gold text-accent-gold'
                    : 'opacity-60 hover:opacity-100'}"
            >
                Press kit
            </button>
        </div>

        {#if loading}
            <div class="text-center py-12 opacity-60">Loading...</div>
        {:else if activeTab === "concerts"}
            <!-- Concerts Tab -->
            <div class="space-y-4">
                <div class="flex justify-end">
                    <button
                        onclick={startAddConcert}
                        class="px-4 py-2 rounded-lg bg-accent-sage text-ink font-gill hover:bg-accent-sage/90 transition-colors"
                    >
                        + Add Concert
                    </button>
                </div>

                {#if isAddingConcert || editingConcert}
                    <div
                        class="bg-paper/10 rounded-xl p-6 border border-paper/20"
                    >
                        <h3 class="font-gill text-xl mb-4">
                            {isAddingConcert ? "New Concert" : "Edit Concert"}
                        </h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    for="concert-title"
                                    class="block text-sm mb-1 opacity-80"
                                    >Title</label
                                >
                                <input
                                    id="concert-title"
                                    type="text"
                                    bind:value={concertForm.title}
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    for="concert-location"
                                    class="block text-sm mb-1 opacity-80"
                                    >Location</label
                                >
                                <input
                                    id="concert-location"
                                    type="text"
                                    bind:value={concertForm.location}
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    for="concert-date"
                                    class="block text-sm mb-1 opacity-80"
                                    >Date</label
                                >
                                <input
                                    id="concert-date"
                                    type="date"
                                    bind:value={concertForm.date}
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    for="concert-time"
                                    class="block text-sm mb-1 opacity-80"
                                    >Time</label
                                >
                                <input
                                    id="concert-time"
                                    type="time"
                                    bind:value={concertForm.time}
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div class="md:col-span-2">
                                <label
                                    for="concert-description"
                                    class="block text-sm mb-1 opacity-80"
                                    >Description <span class="opacity-60">(short, shown on the card)</span></label
                                >
                                <textarea
                                    id="concert-description"
                                    bind:value={concertForm.description}
                                    rows="3"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none resize-none"
                                ></textarea>
                            </div>
                            <div class="md:col-span-2">
                                <label
                                    for="concert-details"
                                    class="block text-sm mb-1 opacity-80"
                                    >Details <span class="opacity-60">(optional, shown on the concert page; separate paragraphs with a blank line)</span></label
                                >
                                <textarea
                                    id="concert-details"
                                    bind:value={concertForm.details}
                                    rows="6"
                                    placeholder=""
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none resize-y"
                                ></textarea>
                            </div>
                            <div class="md:col-span-2">
                                <label
                                    for="concert-program"
                                    class="block text-sm mb-1 opacity-80"
                                    >Programme <span class="opacity-60">(optional, one piece per line, e.g. “Vivaldi — As Quatro Estações”)</span></label
                                >
                                <textarea
                                    id="concert-program"
                                    bind:value={concertForm.program}
                                    rows="5"
                                    placeholder="Vivaldi — As Quatro Estações"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none resize-y"
                                ></textarea>
                            </div>
                            <div>
                                <label
                                    for="concert-price"
                                    class="block text-sm mb-1 opacity-80"
                                    >Price <span class="opacity-60">(optional)</span></label
                                >
                                <input
                                    id="concert-price"
                                    type="text"
                                    bind:value={concertForm.price}
                                    placeholder="e.g. Entrada livre"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    for="concert-ticket-url"
                                    class="block text-sm mb-1 opacity-80"
                                    >Ticket URL <span class="opacity-60">(optional)</span></label
                                >
                                <input
                                    id="concert-ticket-url"
                                    type="url"
                                    bind:value={concertForm.ticketUrl}
                                    placeholder="https://…"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div class="md:col-span-2">
                                <label
                                    for="concert-image-url"
                                    class="block text-sm mb-1 opacity-80"
                                    >Poster image URL <span class="opacity-60">(optional)</span></label
                                >
                                <input
                                    id="concert-image-url"
                                    type="url"
                                    bind:value={concertForm.imageUrl}
                                    placeholder="https://…"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                        </div>
                        <div class="flex gap-3 mt-4">
                            <button
                                onclick={saveConcert}
                                class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onclick={cancelConcertEdit}
                                class="px-4 py-2 rounded-lg border border-paper/30 font-gill hover:bg-paper/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}

                <!-- Concerts List -->
                <div class="space-y-3">
                    {#each concerts as concert (concert.id)}
                        <div
                            class="bg-paper/5 rounded-xl p-4 border border-paper/10 flex items-center justify-between gap-4"
                        >
                            <div class="flex-1 min-w-0">
                                <h4 class="font-gill text-lg truncate">
                                    {concert.title}
                                    {#if !isUpcoming(concert)}
                                        <span
                                            class="ml-2 px-2 py-0.5 rounded text-xs align-middle bg-paper/10 opacity-70"
                                            title="Past concerts are hidden from the website"
                                            >Past</span
                                        >
                                    {/if}
                                </h4>
                                <p class="text-sm opacity-70">
                                    {concert.date} · {concert.time} · {concert.location}
                                </p>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                <a
                                    href={concertUrl(concert)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                    aria-label="View page"
                                >
                                    <ExternalLink size={16} />
                                </a>
                                <button
                                    onclick={() => startEditConcert(concert)}
                                    class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                    aria-label="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onclick={() => deleteConcert(concert.id)}
                                    class="p-2 rounded-lg border border-accent-rose/50 text-accent-rose text-sm hover:bg-accent-rose/10 transition-colors"
                                    aria-label="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {:else if activeTab === "members"}
            <!-- Members Tab -->
            <div class="space-y-6">
                <div class="flex justify-end">
                    <button
                        onclick={startAddSection}
                        class="px-4 py-2 rounded-lg bg-accent-sage text-ink font-gill hover:bg-accent-sage/90 transition-colors"
                    >
                        + Add Section
                    </button>
                </div>

                {#if isAddingSection}
                    <div
                        class="bg-paper/10 rounded-xl p-4 border border-paper/20"
                    >
                        <div class="flex gap-3 items-center">
                            <input
                                type="text"
                                bind:value={newSectionName}
                                placeholder="Section name (e.g., Flautas)"
                                class="flex-1 px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                            />
                            <button
                                onclick={addSection}
                                class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onclick={() => (isAddingSection = false)}
                                class="px-4 py-2 rounded-lg border border-paper/30 font-gill hover:bg-paper/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}

                <div role="list" class="space-y-3">
                    {#each sections as section, sectionIndex (section.name)}
                        {#if dragOverSectionIndex === sectionIndex && draggedSectionIndex !== null}
                            <div
                                class="h-1 bg-accent-gold rounded-full mx-4 mb-2"
                            ></div>
                        {/if}
                        <div
                            class="bg-paper/5 rounded-xl border border-paper/10 overflow-hidden"
                            role="listitem"
                            ondragover={(e) =>
                                handleSectionDragOver(e, sectionIndex)}
                            ondragleave={() => (dragOverSectionIndex = null)}
                            ondrop={(e) => handleSectionDrop(e, sectionIndex)}
                        >
                            <div
                                class="flex items-center justify-between px-4 py-3 bg-paper/5 border-b border-paper/10"
                            >
                                <div class="flex items-center gap-2">
                                    <div
                                        class="cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"
                                        role="button"
                                        aria-label="Drag to reorder section"
                                        tabindex="0"
                                        draggable={true}
                                        ondragstart={() =>
                                            handleSectionDragStart(
                                                sectionIndex,
                                            )}
                                        ondragend={() => {
                                            draggedSectionIndex = null;
                                            dragOverSectionIndex = null;
                                        }}
                                    >
                                        <GripVertical size={20} />
                                    </div>
                                    {#if editingSection === sectionIndex}
                                        <input
                                            type="text"
                                            bind:value={sectionNameForm}
                                            placeholder="Section name"
                                            class="px-3 py-1 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none font-gill text-lg"
                                        />
                                    {:else}
                                        <h3 class="font-gill text-lg">
                                            {section.name}
                                        </h3>
                                    {/if}
                                </div>
                                <div class="flex gap-2">
                                    {#if editingSection === sectionIndex}
                                        <button
                                            onclick={saveSectionName}
                                            class="px-3 py-1 rounded-lg bg-accent-gold text-ink font-gill text-sm hover:bg-accent-gold/90 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onclick={cancelSectionEdit}
                                            class="px-3 py-1 rounded-lg border border-paper/30 font-gill text-sm hover:bg-paper/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    {:else}
                                        <button
                                            onclick={() =>
                                                startEditSection(sectionIndex)}
                                            class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                            aria-label="Rename"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    {/if}
                                    <button
                                        onclick={() =>
                                            deleteSection(sectionIndex)}
                                        class="p-2 rounded-lg border border-accent-rose/50 text-accent-rose text-sm hover:bg-accent-rose/10 transition-colors"
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onclick={() =>
                                            startAddMember(sectionIndex)}
                                        class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                        aria-label="Add member"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                </div>
                            </div>

                            {#if isAddingMember === sectionIndex}
                                <div
                                    class="p-4 bg-paper/10 border-b border-paper/10"
                                >
                                    <div class="grid md:grid-cols-3 gap-3">
                                        <input
                                            type="text"
                                            bind:value={memberForm.name}
                                            placeholder="Name"
                                            class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            bind:value={memberForm.role}
                                            placeholder="Role (optional)"
                                            class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            bind:value={memberForm.degree}
                                            placeholder="Degree"
                                            class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                        />
                                    </div>
                                    <div class="flex gap-2 mt-3">
                                        <button
                                            onclick={addMember}
                                            class="px-3 py-1 rounded-lg bg-accent-gold text-ink font-gill text-sm hover:bg-accent-gold/90 transition-colors"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onclick={cancelMemberEdit}
                                            class="px-3 py-1 rounded-lg border border-paper/30 font-gill text-sm hover:bg-paper/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            <div class="divide-y divide-paper/10" role="list">
                                {#each section.members as member, memberIndex (memberIndex)}
                                    <div class="p-4">
                                        {#if editingMember?.sectionIndex === sectionIndex && editingMember?.memberIndex === memberIndex}
                                            <div
                                                class="grid md:grid-cols-3 gap-3"
                                            >
                                                <input
                                                    type="text"
                                                    bind:value={memberForm.name}
                                                    placeholder="Name"
                                                    class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    bind:value={memberForm.role}
                                                    placeholder="Role (optional)"
                                                    class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    bind:value={
                                                        memberForm.degree
                                                    }
                                                    placeholder="Degree"
                                                    class="px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                                />
                                            </div>
                                            <div class="flex gap-2 mt-3">
                                                <button
                                                    onclick={saveMemberEdit}
                                                    class="px-3 py-1 rounded-lg bg-accent-gold text-ink font-gill text-sm hover:bg-accent-gold/90 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onclick={cancelMemberEdit}
                                                    class="px-3 py-1 rounded-lg border border-paper/30 font-gill text-sm hover:bg-paper/10 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        {:else}
                                            <div
                                                class="flex items-center justify-between gap-4"
                                            >
                                                <div class="flex-1 min-w-0">
                                                    <span class="font-medium"
                                                        >{member.name}</span
                                                    >
                                                    {#if member.role}
                                                        <span
                                                            class="text-accent-gold ml-2"
                                                            >({member.role})</span
                                                        >
                                                    {/if}
                                                    {#if member.degree}
                                                        <p
                                                            class="text-sm opacity-60 mt-1"
                                                        >
                                                            {member.degree}
                                                        </p>
                                                    {/if}
                                                </div>
                                                <div
                                                    class="flex gap-2 shrink-0"
                                                >
                                                    <button
                                                        onclick={() =>
                                                            startEditMember(
                                                                sectionIndex,
                                                                memberIndex,
                                                            )}
                                                        class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onclick={() =>
                                                            deleteMember(
                                                                sectionIndex,
                                                                memberIndex,
                                                            )}
                                                        class="p-2 rounded-lg border border-accent-rose/50 text-accent-rose text-sm hover:bg-accent-rose/10 transition-colors"
                                                        aria-label="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                                {#if section.members.length === 0}
                                    <div
                                        class="p-4 text-sm opacity-50 text-center"
                                    >
                                        No members in this section yet
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>

                <!-- Join Form URL -->
                <div class="bg-paper/10 rounded-xl p-6 border border-paper/20">
                    <h3 class="font-gill text-xl mb-4">Application Form</h3>
                    <p class="text-sm opacity-70 mb-4">
                        URL of the application form for new members. Leave empty to hide this section.
                    </p>
                    <div class="flex gap-3">
                        <input
                            id="join-form-url"
                            type="url"
                            bind:value={joinFormUrl}
                            placeholder="https://..."
                            class="flex-1 px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                        />
                        <button
                            onclick={saveJoinFormUrl}
                            class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors whitespace-nowrap"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        {:else if activeTab === "gallery"}
            <!-- Gallery Tab -->
            <div class="space-y-6">
                <div class="bg-paper/10 rounded-xl p-6 border border-paper/20">
                    <h3 class="font-gill text-xl mb-4">Immich Album</h3>
                    <p class="text-sm opacity-70 mb-4">
                        Share link of the Immich album shown in the website's
                        gallery (e.g. https://photos.ceist.pt/share/…). The
                        website shows a random selection of its photos. Changes
                        in Immich can take up to 10 minutes to appear.
                    </p>
                    <div class="flex gap-3">
                        <input
                            id="gallery-album-url"
                            type="url"
                            bind:value={galleryAlbumUrl}
                            placeholder="https://photos.ceist.pt/share/..."
                            class="flex-1 px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                        />
                        <button
                            onclick={saveGalleryAlbumUrl}
                            class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors whitespace-nowrap"
                        >
                            Save
                        </button>
                    </div>
                </div>

                <div>
                    <p class="text-sm opacity-70 mb-3">
                        {#if galleryPreviewLoading}
                            Loading photos...
                        {:else if galleryPreview.length === 0}
                            No photos found. Check that the share link is
                            correct and that the album isn't empty.
                        {:else}
                            {galleryPreview.length} photos available
                        {/if}
                    </p>
                    <div
                        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
                    >
                        {#each galleryPreview.slice(0, 24) as photo (photo.id)}
                            <a
                                href={photo.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="aspect-square rounded-lg overflow-hidden bg-paper/5"
                            >
                                <img
                                    src={photo.url}
                                    alt=""
                                    loading="lazy"
                                    class="w-full h-full object-cover"
                                />
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if activeTab === "press"}
            <!-- Press Kit Tab -->
            <div class="space-y-6">
                <p class="text-sm opacity-70 max-w-3xl">
                    Files offered for download at
                    <a href="/imprensa" target="_blank" class="underline underline-offset-4"
                        >ceist.pt/imprensa</a
                    >. Build them with <code>build-kit.sh</code> in the design
                    repository (<code>designs/2026-10-media-kit</code>) and upload
                    the new versions here. Uploading replaces the current file;
                    the download links stay the same.
                </p>

                {#if pressError}
                    <p class="px-4 py-3 rounded-lg bg-accent-rose/20 border border-accent-rose/50 text-sm">
                        {pressError}
                    </p>
                {/if}

                {#each pressSlots as slot (slot.kind)}
                    {@const file = pressFiles[slot.kind]}
                    <div class="bg-paper/10 rounded-xl p-6 border border-paper/20">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h3 class="font-gill text-xl mb-1">{slot.label}</h3>
                                <p class="text-sm opacity-60 mb-3">{slot.hint}</p>
                                {#if file}
                                    <p class="text-sm">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            class="underline underline-offset-4"
                                            >{file.name}</a
                                        >
                                        <span class="opacity-60">
                                            · {formatSize(file.size)} · uploaded
                                            {new Date(file.updatedAt).toLocaleString("pt-PT", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </p>
                                {:else}
                                    <p class="text-sm opacity-60">
                                        Not uploaded yet: the download is hidden on
                                        the website.
                                    </p>
                                {/if}
                            </div>
                            <div class="flex gap-3">
                                <label
                                    class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill whitespace-nowrap transition-colors
                                    {pressUploading
                                        ? 'opacity-50 pointer-events-none'
                                        : 'cursor-pointer hover:bg-accent-gold/90'}"
                                >
                                    {file ? "Replace" : "Upload"}
                                    <input
                                        type="file"
                                        accept={slot.accept}
                                        class="sr-only"
                                        disabled={pressUploading !== null}
                                        onchange={(e) => uploadPressFile(slot.kind, e)}
                                    />
                                </label>
                                {#if file}
                                    <button
                                        onclick={() => deletePressFile(slot.kind)}
                                        disabled={pressUploading !== null}
                                        class="p-2 rounded-lg border border-accent-rose/50 text-accent-rose text-sm hover:bg-accent-rose/10 transition-colors"
                                        aria-label="Remove"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                {/if}
                            </div>
                        </div>
                        {#if pressUploading === slot.kind}
                            <div class="mt-4 h-2 rounded-full bg-paper/10 overflow-hidden">
                                <div
                                    class="h-full bg-accent-gold transition-[width]"
                                    style="width: {Math.round(pressProgress * 100)}%"
                                ></div>
                            </div>
                            <p class="mt-2 text-sm opacity-60">
                                {pressProgress < 1
                                    ? `Uploading… ${Math.round(pressProgress * 100)}%`
                                    : "Saving…"}
                            </p>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
