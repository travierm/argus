<script lang="ts">
	import { Code, Eye } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import ShikiService from '$lib/shikiService';

	interface Props {
		title?: string;
		code: string;
		lang?: string;
		children: import('svelte').Snippet;
	}

	let { title, code, lang = 'html', children }: Props = $props();
	let showCode = $state(false);
	let highlightedCode = $state<string>('');
	let isHighlighting = $state(true);

	onMount(async () => {
		const shiki = ShikiService.getInstance();
		try {
			await shiki.init();
			highlightedCode = await shiki.highlight(code, lang);
		} catch (error) {
			console.error('Failed to highlight code:', error);
			highlightedCode = code;
		} finally {
			isHighlighting = false;
		}

		return () => {
			shiki.dispose();
		};
	});
</script>

<div
	class="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
>
	<!-- Header -->
	<div
		class="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700"
	>
		<div class="flex items-center gap-2">
			{#if title}
				<span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</span>
			{/if}
		</div>
		<button
			on:click={() => (showCode = !showCode)}
			class="btn btn-ghost btn-sm flex w-20 items-center gap-1.5"
			title={showCode ? 'Show preview' : 'Show code'}
		>
			{#if showCode}
				<Eye class="h-4 w-4" />
				<span class="text-xs">Preview</span>
			{:else}
				<Code class="h-4 w-4" />
				<span class="text-xs">Code</span>
			{/if}
		</button>
	</div>

	<!-- Content -->
	<div class="px-4 pb-4">
		{#if showCode}
			{#if isHighlighting}
				<div class="flex items-center justify-center p-8 text-sm text-neutral-500">
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
						<span>Highlighting...</span>
					</div>
				</div>
			{:else}
				<pre
					class="overflow-x-auto rounded-md bg-neutral-50 p-4 text-sm dark:bg-neutral-950"><code class="font-mono">{@html highlightedCode}</code></pre>
			{/if}
		{:else}
			<div class="flex items-center justify-center p-4">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
