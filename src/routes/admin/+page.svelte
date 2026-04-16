<script lang="ts">
    import { onMount } from "svelte";
    import {
        GripVertical,
        Pencil,
        Trash2,
        UserPlus,
        Image,
    } from "@lucide/svelte";
    import type { NewsItem } from "$lib/data/news";
    import type { Section, Member } from "$lib/data/members";
    import type { GalleryPhoto } from "$lib/data/gallery";
    import type { Album } from "$lib/data/albums";

    let activeTab = $state<"concerts" | "members" | "gallery" | "albums">(
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
    let galleryPhotos = $state<GalleryPhoto[]>([]);
    let newPhotoUrl = $state("");
    let isAddingPhoto = $state(false);

    // Albums state
    let albums = $state<Album[]>([]);
    let isAddingAlbum = $state(false);
    let editingAlbum = $state<Album | null>(null);
    let albumForm = $state<Partial<Album>>({});

    // Settings state
    let joinFormUrl = $state("");

    // Loading/saving state
    let loading = $state(true);
    let saveMessage = $state("");

    onMount(() => {
        loadData();
    });

    async function loadData() {
        loading = true;
        try {
            const [concertsRes, membersRes, galleryRes, albumsRes, settingsRes] =
                await Promise.all([
                    fetch("/api/concerts"),
                    fetch("/api/members"),
                    fetch("/api/gallery"),
                    fetch("/api/albums"),
                    fetch("/api/settings"),
                ]);
            concerts = await concertsRes.json();
            sections = await membersRes.json();
            galleryPhotos = await galleryRes.json();
            albums = await albumsRes.json();
            const settings = await settingsRes.json();
            joinFormUrl = settings.joinFormUrl ?? "";
            sortMembers();
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

    // Gallery CRUD
    function startAddPhoto() {
        isAddingPhoto = true;
        newPhotoUrl = "";
    }

    function cancelAddPhoto() {
        isAddingPhoto = false;
        newPhotoUrl = "";
    }

    async function addPhoto() {
        if (!newPhotoUrl.trim()) return;

        const response = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: newPhotoUrl.trim() }),
        });

        if (response.ok) {
            const newPhoto = await response.json();
            galleryPhotos = [...galleryPhotos, newPhoto];
            showMessage("Photo added");
        }

        cancelAddPhoto();
    }

    async function deletePhoto(id: string) {
        if (!confirm("Are you sure you want to remove this photo?")) return;

        const response = await fetch("/api/gallery", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            galleryPhotos = galleryPhotos.filter((p) => p.id !== id);
            showMessage("Photo removed");
        }
    }

    // Albums CRUD
    function startAddAlbum() {
        isAddingAlbum = true;
        editingAlbum = null;
        albumForm = {
            title: "",
            date: "",
            location: "",
            coverUrl: "",
            albumUrl: "",
        };
    }

    function startEditAlbum(album: Album) {
        editingAlbum = album;
        isAddingAlbum = false;
        albumForm = { ...album };
    }

    function cancelAlbumEdit() {
        isAddingAlbum = false;
        editingAlbum = null;
        albumForm = {};
    }

    async function saveAlbum() {
        if (!albumForm.title || !albumForm.coverUrl || !albumForm.albumUrl)
            return;

        if (isAddingAlbum) {
            const response = await fetch("/api/albums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(albumForm),
            });

            if (response.ok) {
                const newAlbum = await response.json();
                albums = [...albums, newAlbum];
                showMessage("Album added");
            }
        } else if (editingAlbum) {
            const response = await fetch("/api/albums", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editingAlbum, ...albumForm }),
            });

            if (response.ok) {
                const updated = await response.json();
                albums = albums.map((a) => (a.id === updated.id ? updated : a));
                showMessage("Album updated");
            }
        }

        cancelAlbumEdit();
    }

    async function deleteAlbum(id: string) {
        if (!confirm("Are you sure you want to delete this album?")) return;

        const response = await fetch("/api/albums", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            albums = albums.filter((a) => a.id !== id);
            showMessage("Album deleted");
        }
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
                onclick={() => (activeTab = "albums")}
                class="pb-3 px-2 font-gill transition-all {activeTab ===
                'albums'
                    ? 'border-b-2 border-accent-gold text-accent-gold'
                    : 'opacity-60 hover:opacity-100'}"
            >
                Albums
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
                                    >Description</label
                                >
                                <textarea
                                    id="concert-description"
                                    bind:value={concertForm.description}
                                    rows="3"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none resize-none"
                                ></textarea>
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
                                </h4>
                                <p class="text-sm opacity-70">
                                    {concert.date} · {concert.time} · {concert.location}
                                </p>
                            </div>
                            <div class="flex gap-2 shrink-0">
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
                <div class="flex justify-end">
                    <button
                        onclick={startAddPhoto}
                        class="px-4 py-2 rounded-lg bg-accent-sage text-ink font-gill hover:bg-accent-sage/90 transition-colors"
                    >
                        + Add Photo
                    </button>
                </div>

                {#if isAddingPhoto}
                    <div
                        class="bg-paper/10 rounded-xl p-4 border border-paper/20"
                    >
                        <div class="flex gap-3 items-end">
                            <div class="flex-1">
                                <label
                                    for="photo-url"
                                    class="block text-sm mb-1 opacity-80"
                                    >Photo URL</label
                                >
                                <input
                                    id="photo-url"
                                    type="url"
                                    bind:value={newPhotoUrl}
                                    placeholder="https://example.com/photo.jpg"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <button
                                onclick={addPhoto}
                                class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onclick={cancelAddPhoto}
                                class="px-4 py-2 rounded-lg border border-paper/30 font-gill hover:bg-paper/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}

                {#if galleryPhotos.length === 0}
                    <div
                        class="text-center py-12 opacity-60 bg-paper/5 rounded-xl border border-paper/10"
                    >
                        <Image class="mx-auto mb-4 opacity-40" size={48} />
                        <p>No gallery photos yet</p>
                        <p class="text-sm mt-1">
                            Add photo URLs to display in the gallery section
                        </p>
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        {#each galleryPhotos as photo (photo.id)}
                            <div
                                class="aspect-square rounded-lg relative overflow-hidden group border border-paper/10"
                            >
                                <img
                                    src={photo.url}
                                    alt=""
                                    class="w-full h-full object-cover"
                                />
                                <div
                                    class="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <button
                                        onclick={() => deletePhoto(photo.id)}
                                        class="p-3 rounded-full bg-accent-rose text-paper hover:bg-accent-rose/80 transition-colors"
                                        aria-label="Delete photo"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {:else}
            <!-- Albums Tab -->
            <div class="space-y-6">
                <div class="flex justify-end">
                    <button
                        onclick={startAddAlbum}
                        class="px-4 py-2 rounded-lg bg-accent-sage text-ink font-gill hover:bg-accent-sage/90 transition-colors"
                    >
                        + Add Album
                    </button>
                </div>

                {#if isAddingAlbum || editingAlbum}
                    <div
                        class="bg-paper/10 rounded-xl p-6 border border-paper/20"
                    >
                        <h3 class="font-gill text-xl mb-4">
                            {isAddingAlbum ? "New Album" : "Edit Album"}
                        </h3>
                        <div class="space-y-4">
                            <div>
                                <label
                                    for="album-title"
                                    class="block text-sm mb-1 opacity-80"
                                    >Album Title</label
                                >
                                <input
                                    id="album-title"
                                    type="text"
                                    bind:value={albumForm.title}
                                    placeholder="e.g., Concerto de Natal 2025"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        for="album-date"
                                        class="block text-sm mb-1 opacity-80"
                                        >Date</label
                                    >
                                    <input
                                        id="album-date"
                                        type="date"
                                        bind:value={albumForm.date}
                                        class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label
                                        for="album-location"
                                        class="block text-sm mb-1 opacity-80"
                                        >Location</label
                                    >
                                    <input
                                        id="album-location"
                                        type="text"
                                        bind:value={albumForm.location}
                                        placeholder="e.g., Aula Magna, IST"
                                        class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    for="album-cover"
                                    class="block text-sm mb-1 opacity-80"
                                    >Cover Photo URL</label
                                >
                                <input
                                    id="album-cover"
                                    type="url"
                                    bind:value={albumForm.coverUrl}
                                    placeholder="https://example.com/cover.jpg"
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label
                                    for="album-url"
                                    class="block text-sm mb-1 opacity-80"
                                    >Immich Album URL</label
                                >
                                <input
                                    id="album-url"
                                    type="url"
                                    bind:value={albumForm.albumUrl}
                                    placeholder="https://photos.example.com/album/..."
                                    class="w-full px-3 py-2 rounded-lg bg-paper/5 border border-paper/30 focus:border-accent-gold focus:outline-none"
                                />
                            </div>
                        </div>
                        <div class="flex gap-3 mt-4">
                            <button
                                onclick={saveAlbum}
                                class="px-4 py-2 rounded-lg bg-accent-gold text-ink font-gill hover:bg-accent-gold/90 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onclick={cancelAlbumEdit}
                                class="px-4 py-2 rounded-lg border border-paper/30 font-gill hover:bg-paper/10 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                {/if}

                {#if albums.length === 0}
                    <div
                        class="text-center py-12 opacity-60 bg-paper/5 rounded-xl border border-paper/10"
                    >
                        <Image class="mx-auto mb-4 opacity-40" size={48} />
                        <p>No albums yet</p>
                        <p class="text-sm mt-1">
                            Add albums to display on the gallery page
                        </p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each albums as album (album.id)}
                            <div
                                class="bg-paper/5 rounded-xl border border-paper/10 overflow-hidden flex"
                            >
                                <div class="w-32 h-24 shrink-0">
                                    <img
                                        src={album.coverUrl}
                                        alt=""
                                        class="w-full h-full object-cover"
                                    />
                                </div>
                                <div
                                    class="flex-1 p-4 flex items-center justify-between gap-4 overflow-hidden"
                                >
                                    <div class="min-w-0 flex-1">
                                        <h4 class="font-gill text-lg truncate">
                                            {album.title}
                                        </h4>
                                        {#if album.date || album.location}
                                            <p
                                                class="text-sm opacity-60 truncate"
                                            >
                                                {#if album.date && album.location}
                                                    {album.date} · {album.location}
                                                {:else}
                                                    {album.date ||
                                                        album.location}
                                                {/if}
                                            </p>
                                        {/if}
                                    </div>
                                    <div class="flex gap-2 shrink-0">
                                        <button
                                            onclick={() =>
                                                startEditAlbum(album)}
                                            class="p-2 rounded-lg border border-paper/30 text-sm hover:bg-paper/10 transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onclick={() =>
                                                deleteAlbum(album.id)}
                                            class="p-2 rounded-lg border border-accent-rose/50 text-accent-rose text-sm hover:bg-accent-rose/10 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
