<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if (import.meta.env.DEV) {
			import('$lib/dev/BrowserLogs').then(({ initBrowserLogger }) => {
				initBrowserLogger('/api/logs');
			});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
