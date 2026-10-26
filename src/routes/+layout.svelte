<script lang="ts">
	import "../app.css";
	import { page } from "$app/state";

	let { children } = $props();

	const defaultTitle = "CEIST — Camerata de Estudantes do Instituto Superior Técnico";
	const defaultDescription =
		"Orquestra de câmara formada por estudantes e alumni do Instituto Superior Técnico. Descobre os nossos concertos e eventos.";

	// Pages can override these by returning `meta` from their load function
	let title = $derived(page.data.meta?.title ?? defaultTitle);
	let description = $derived(page.data.meta?.description || defaultDescription);
	let image = $derived(page.data.meta?.image);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="pt_PT" />
	<meta property="og:site_name" content="CEIST" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
</svelte:head>

{@render children()}
