<script lang="ts">
    let dialog: HTMLDialogElement;
    let email = $state("");
    let status = $state<"idle" | "loading" | "success" | "error">("idle");
    let errorMessage = $state("");

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        status = "loading";
        errorMessage = "";

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                status = "success";
                email = "";
                // Close dialog after a delay
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                status = "error";
                errorMessage =
                    result.error || "Ocorreu um erro. Tente novamente.";
            }
        } catch (e) {
            status = "error";
            errorMessage = "Erro de ligação. Verifique a sua internet.";
        }
    }

    function handleOpen() {
        dialog?.showModal();
        status = "idle";
        errorMessage = "";
    }

    function handleClose() {
        dialog?.close();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === dialog) {
            handleClose();
        }
    }
</script>

<section class="py-24 max-md:py-16 bg-ink text-paper relative overflow-hidden">
    <div
        class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(247,247,245,0.05)_0%,transparent_50%)] pointer-events-none"
    ></div>

    <div class="max-w-5xl mx-auto px-8 text-center relative">
        <div class="mb-8 animate-[float_3s_ease-in-out_infinite]">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mx-auto"
            >
                <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        </div>
        <h2 class="text-[clamp(1.75rem,4vw,2.5rem)] mb-8">
            Mantenha-se Informado
        </h2>
        <p class="max-w-[50ch] mx-auto opacity-90 mb-8">
            Subscreva a nossa newsletter e receba em primeira mão informações
            sobre concertos e novidades da CEIST.
        </p>
        <button
            onclick={handleOpen}
            class="inline-flex items-center gap-2 px-8 py-4 font-gill text-sm uppercase
             border-2 border-paper bg-transparent cursor-pointer transition-all duration-300
             hover:bg-paper hover:text-ink group"
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
                <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
            </svg>
            Subscrever Newsletter
        </button>
    </div>
</section>

<dialog
    bind:this={dialog}
    onclick={handleBackdropClick}
    class="bg-paper text-ink p-0 border-0 shadow-2xl backdrop:backdrop-blur-sm backdrop:bg-ink/50 max-w-md w-[calc(100%-2rem)] m-auto rounded-lg"
>
    <div class="p-8">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-gill uppercase tracking-wider">
                Newsletter
            </h3>
            <button
                onclick={handleClose}
                class="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Fechar"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        {#if status === "success"}
            <div
                class="py-12 text-center animate-in fade-in zoom-in duration-300"
            >
                <div
                    class="w-16 h-16 bg-accent-sage/20 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-sage"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><polyline points="20 6 9 17 4 12"></polyline></svg
                    >
                </div>
                <p class="text-lg">Subscrição efetuada com sucesso!</p>
                <p class="text-sm opacity-60">
                    Verifique o seu email para confirmar.
                </p>
            </div>
        {:else}
            <p class="mb-6 opacity-80">
                Insira o seu email para receber as nossas atualizações.
            </p>

            <form onsubmit={handleSubmit} class="flex flex-col gap-4">
                <input
                    type="email"
                    bind:value={email}
                    placeholder="o-seu@email.com"
                    required
                    class="w-full px-4 py-3 border-2 border-ink/10 focus:border-ink outline-none transition-colors bg-transparent"
                />

                {#if status === "error"}
                    <p class="text-red-500 text-sm">{errorMessage}</p>
                {/if}

                <button
                    type="submit"
                    disabled={status === "loading"}
                    class="w-full bg-ink text-paper py-4 font-gill text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {#if status === "loading"}
                        A processar...
                    {:else}
                        Subscrever
                    {/if}
                </button>
            </form>
        {/if}
    </div>
</dialog>

<style>
    dialog {
        transition:
            opacity 0.3s ease-out,
            transform 0.3s ease-out,
            display 0.3s ease-out allow-discrete;
        transform: translateY(0);
        opacity: 1;
    }

    dialog[open] {
        opacity: 1;
        transform: translateY(0);
    }

    @starting-style {
        dialog[open] {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    dialog::backdrop {
        background-color: rgba(26, 26, 26, 0.5);
        backdrop-filter: blur(4px);
        opacity: 1;
        transition:
            opacity 0.3s ease-out,
            display 0.3s ease-out allow-discrete;
    }

    @starting-style {
        dialog[open]::backdrop {
            opacity: 0;
        }
    }
</style>
