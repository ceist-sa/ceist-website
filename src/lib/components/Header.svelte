<script lang="ts">
  import { Menu, X } from "@lucide/svelte";
  import { onMount } from "svelte";

  let mobileMenuOpen = $state(false);

  const navItems = [
    { label: "Início", href: "/#hero" },
    { label: "Concertos", href: "/#news" },
    { label: "Galeria", href: "/galeria" },
    { label: "Músicos", href: "/#members" },
    { label: "Contacto", href: "/#contact" },
  ];

  const toggleMenu = () => {
    mobileMenuOpen = !mobileMenuOpen;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  };

  const closeMenu = () => {
    mobileMenuOpen = false;
    document.body.style.overflow = "";
  };

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });
</script>

<header
  class="fixed top-0 left-0 right-0 h-header bg-paper/90 backdrop-blur-md z-50 border-b border-ink/10"
>
  <div class="flex items-center justify-between h-full max-w-5xl mx-auto px-8">
    <a href="/" class="flex items-center" onclick={closeMenu}>
      <img src="/icon.svg" alt="CEIST" class="h-9 w-auto" />
    </a>

    <nav class="hidden md:flex gap-8">
      {#each navItems as item}
        <a
          href={item.href}
          class="font-gill text-sm uppercase relative
                 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5
                 after:bg-current after:transition-[width] after:duration-300 hover:after:w-full"
        >
          {item.label}
        </a>
      {/each}
    </nav>

    <button
      class="md:hidden p-2 -mr-2"
      aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      onclick={toggleMenu}
    >
      {#if mobileMenuOpen}
        <X class="w-6 h-6" />
      {:else}
        <Menu class="w-6 h-6" />
      {/if}
    </button>
  </div>
</header>

<div
  class="md:hidden fixed inset-0 top-header bg-paper z-60 transition-all duration-300 ease-in-out
         {mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}"
>
  <nav class="flex flex-col items-center justify-center h-full gap-8">
    {#each navItems as item}
      <a
        href={item.href}
        class="font-gill text-lg uppercase hover:text-accent-rose transition-colors"
        onclick={closeMenu}
      >
        {item.label}
      </a>
    {/each}
  </nav>
</div>
