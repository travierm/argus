<script lang="ts">
	import { theme } from '$lib';
	import { Lightbulb, MoonIcon } from '@lucide/svelte';
</script>

<button on:click={theme.toggle} class="btn btn-ghost btn-sm max-w-15">
	<Lightbulb class="hidden text-orange-400 dark:inline" />
	<MoonIcon class="inline dark:hidden" />
</button>
