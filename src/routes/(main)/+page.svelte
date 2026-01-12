<script lang="ts">
    import Hero from "$lib/components/Hero.svelte";
    import NewsSection from "$lib/components/NewsSection.svelte";
    import NewsletterSection from "$lib/components/NewsletterSection.svelte";
    import GallerySection from "$lib/components/GallerySection.svelte";
    import MembersSection from "$lib/components/MembersSection.svelte";
    import Footer from "$lib/components/Footer.svelte";

    let { data } = $props();
</script>

<Hero concerts={data.concerts} />
<NewsSection concerts={data.concerts} />
<NewsletterSection />
<GallerySection photos={data.galleryPhotos} />
<MembersSection sections={data.sections} />
<Footer />
