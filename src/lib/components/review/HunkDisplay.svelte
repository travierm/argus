<script lang="ts">
	import type { Hunk } from '$lib/diffParser';
	import ChangeRow from './ChangeRow.svelte';

	interface Props {
		parentKey: string;
		hunk: Hunk;
		highlightedLines?: Map<number, string>;
	}

	let { parentKey, hunk, highlightedLines }: Props = $props();
</script>

<div class="mb-0">
	<!-- Add hunk header -->
	<div
		class="border-t border-gh-border-default bg-gh-canvas-subtle px-4 py-2 font-mono text-xs text-gh-fg-muted"
	>
		{hunk.content}
	</div>

	<div class="flex flex-col">
		{#each hunk.changes as change, idx (parentKey + '-' + idx)}
			<ChangeRow {change} highlightedContent={highlightedLines?.get(idx)} />
		{/each}
	</div>
</div>
