<script lang="ts">
    import Hero from "$lib/components/Hero.svelte";
    import NewsSection from "$lib/components/NewsSection.svelte";
    import NewsletterSection from "$lib/components/NewsletterSection.svelte";
    import GallerySection from "$lib/components/GallerySection.svelte";
    import MembersSection from "$lib/components/MembersSection.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { data } = $props();
</script>

<svelte:head>
	<title>CEIST — Camerata de Estudantes do Instituto Superior Técnico</title>
	<meta
		name="description"
		content="Orquestra de câmara formada por estudantes e alumni. Descobre os nossos concertos e eventos."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/svg+xml" href="/icon.svg" />
</svelte:head>

<Hero concerts={data.concerts} />
<NewsSection concerts={data.concerts} />
<NewsletterSection />
<GallerySection photos={data.galleryPhotos} />
<MembersSection sections={data.sections} joinFormUrl={data.settings.joinFormUrl} />
<Footer />
