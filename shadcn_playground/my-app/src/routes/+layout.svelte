<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import AppSidebar from "$lib/components/app-sidebar.svelte";

    // In Svelte 5, children is automatically available as a prop
    let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head> 

<Sidebar.Provider>
  <AppSidebar />
  <main>
    <Sidebar.Trigger />
    {@render children()}
  </main>
</Sidebar.Provider>
