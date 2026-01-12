<script lang="ts">
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>CEIST — Camerata de Estudantes do Instituto Superior Técnico</title>
	<meta
		name="description"
		content="Orquestra de câmara formada por estudantes e alumni do Instituto Superior Técnico. Descubra os nossos concertos e eventos."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/svg+xml" href="/icon.svg" />
</svelte:head>

{@render children()}
