<script lang="ts">
	import { onMount } from 'svelte';
	import { signatureHTML, signatureText, type SignatureData } from './signature';

	const STORAGE_KEY = 'ceist-signature';

	let data = $state<SignatureData>({ name: '', role: '', email: '', phone: '' });
	let status = $state('');
	let loaded = $state(false);

	const trimmed = $derived<SignatureData>({
		name: data.name.trim(),
		role: data.role.trim(),
		email: data.email.trim(),
		phone: data.phone.trim()
	});
	const preview = $derived(signatureHTML(trimmed, '/email/icon-ink.png'));

	// Remember what was typed, so reopening the page keeps it.
	onMount(() => {
		try {
			Object.assign(data, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
		} catch {}
		loaded = true;
	});
	$effect(() => {
		if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
	});

	async function copyRich(html: string, text: string) {
		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': new Blob([html], { type: 'text/html' }),
					'text/plain': new Blob([text], { type: 'text/plain' })
				})
			]);
		} catch {
			// Older browsers: copy a rendered, selected copy of the signature.
			const tmp = document.createElement('div');
			tmp.innerHTML = html;
			tmp.style.cssText = 'position:fixed;left:-9999px;top:0;';
			document.body.appendChild(tmp);
			const range = document.createRange();
			range.selectNodeContents(tmp);
			getSelection()?.removeAllRanges();
			getSelection()?.addRange(range);
			document.execCommand('copy');
			getSelection()?.removeAllRanges();
			tmp.remove();
		}
	}

	async function copySignature() {
		await copyRich(signatureHTML(trimmed), signatureText(trimmed));
		status = 'Copiada. Agora cola-a nas definições do teu email (instruções em baixo).';
	}

	async function copyCode() {
		await navigator.clipboard.writeText(signatureHTML(trimmed));
		status = 'Código HTML copiado.';
	}

	const fields = [
		{ key: 'name', label: 'Nome', optional: false, type: 'text', autocomplete: 'name', placeholder: 'Nome Apelido' },
		{ key: 'role', label: 'Cargo', optional: true, type: 'text', autocomplete: 'off', placeholder: 'ex.: Direção, Violino, Produção' },
		{ key: 'email', label: 'Email', optional: true, type: 'email', autocomplete: 'email', placeholder: 'nome@exemplo.pt' },
		{ key: 'phone', label: 'Telemóvel', optional: true, type: 'tel', autocomplete: 'tel', placeholder: '+351 912 345 678' }
	] as const;

	const label = 'font-gill tracking-gill uppercase';
</script>

<svelte:head>
	<title>Assinatura de email — CEIST</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-paper text-ink">
	<div class="max-w-5xl mx-auto px-8 max-md:px-5 pt-14 pb-20">
		<header
			class="flex items-end justify-between gap-8 border-b border-[#C9C8C4] pb-7 mb-10 max-md:flex-col-reverse max-md:items-start"
		>
			<div>
				<p class="{label} text-[15px] mb-1.5">Para a equipa</p>
				<h1 class="font-lora tracking-lora font-bold uppercase text-3xl leading-tight">
					Assinatura de email
				</h1>
			</div>
			<a href="/"><img src="/full-logo.svg" alt="CEIST · Camerata de Estudantes do Instituto Superior Técnico" class="h-16" /></a>
		</header>

		<div class="grid grid-cols-[320px_1fr] max-md:grid-cols-1 gap-12 items-start">
			<form onsubmit={(e) => e.preventDefault()}>
				<h2 class="{label} text-sm mb-5">Os teus dados</h2>
				{#each fields as f (f.key)}
					<label class="block mb-5">
						<span class="block {label} text-xs mb-1.5">
							{f.label}
							{#if f.optional}<small class="font-lora normal-case tracking-normal opacity-60 text-xs">(opcional)</small>{/if}
						</span>
						<input
							bind:value={data[f.key]}
							type={f.type}
							autocomplete={f.autocomplete}
							placeholder={f.placeholder}
							class="w-full bg-white border border-[#BDBCB8] px-3 py-2.5 text-base placeholder:text-[#9A9995] focus:outline-2 focus:outline-ink focus:-outline-offset-1"
						/>
					</label>
				{/each}
			</form>

			<div>
				<h2 class="{label} text-sm mb-5">Pré-visualização</h2>
				<div class="bg-white border border-[#DAD9D5] px-9 pt-8 pb-10 max-md:px-5 overflow-x-auto">
					<div aria-hidden="true" class="mb-7">
						<div class="h-2.5 bg-[#EEEDEA] mb-2.5 w-[92%]"></div>
						<div class="h-2.5 bg-[#EEEDEA] mb-2.5 w-[84%]"></div>
						<div class="h-2.5 bg-[#EEEDEA] w-[40%]"></div>
					</div>
					{@html preview}
				</div>
				<div class="flex flex-wrap gap-3 mt-6 mb-2.5">
					<button
						type="button"
						onclick={copySignature}
						disabled={!trimmed.name}
						class="{label} text-sm border border-ink bg-ink text-paper px-5 py-3.5 cursor-pointer disabled:opacity-35 disabled:cursor-default"
					>
						Copiar assinatura
					</button>
					<button
						type="button"
						onclick={copyCode}
						disabled={!trimmed.name}
						class="{label} text-sm border border-ink px-5 py-3.5 cursor-pointer disabled:opacity-35 disabled:cursor-default"
					>
						Copiar código HTML
					</button>
				</div>
				<p class="min-h-[1.6em] text-[15px]" role="status">
					{trimmed.name ? status : 'Escreve o teu nome para poderes copiar.'}
				</p>
			</div>
		</div>

		<section class="mt-14 border-t border-[#C9C8C4] pt-9">
			<h2 class="{label} text-sm mb-5">Como instalar</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-10 gap-y-7 text-[15px] leading-relaxed">
				<div>
					<h3 class="font-lora tracking-lora font-bold text-[17px] mb-2">Gmail</h3>
					<ol class="list-decimal pl-5 space-y-1">
						<li>Roda dentada → <b>Ver todas as definições</b>.</li>
						<li>Separador <b>Geral</b>, secção <b>Assinatura</b> → <b>Criar nova</b>.</li>
						<li>Cola (Ctrl+V ou ⌘V) e carrega em <b>Guardar alterações</b>, no fundo da página.</li>
					</ol>
				</div>
				<div>
					<h3 class="font-lora tracking-lora font-bold text-[17px] mb-2">Outlook</h3>
					<ol class="list-decimal pl-5 space-y-1">
						<li>Definições → <b>Conta</b> (ou <b>Correio</b>) → <b>Assinaturas</b>.</li>
						<li>Cria uma assinatura nova e cola-a no editor.</li>
						<li>Escolhe-a para mensagens novas e respostas, e guarda.</li>
					</ol>
				</div>
				<div>
					<h3 class="font-lora tracking-lora font-bold text-[17px] mb-2">Apple Mail</h3>
					<ol class="list-decimal pl-5 space-y-1">
						<li>Mail → Definições → <b>Assinaturas</b> → <b>+</b>.</li>
						<li>Desmarca “Corresponder sempre ao tipo de letra predefinido da mensagem”.</li>
						<li>Apaga o texto de exemplo e cola.</li>
					</ol>
				</div>
				<div>
					<h3 class="font-lora tracking-lora font-bold text-[17px] mb-2">Thunderbird e outros</h3>
					<p>
						Usa <b>Copiar código HTML</b>. No Thunderbird: Definições da conta → marca “Usar HTML” → cola o
						código no texto da assinatura. As apps de telemóvel só aceitam texto simples: aí basta o nome e
						“CEIST · ceist.pt”.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
