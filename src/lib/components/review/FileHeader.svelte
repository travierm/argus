<script lang="ts">
	import type { DiffInfo } from '$lib/diffParser';
	import { ChevronDown } from '@lucide/svelte';
	import { getFileTypeLabel, getDiffTypeColor, getFilePath } from './diffViewerUtils';

	interface Props {
		diff: DiffInfo;
		isExpanded: boolean;
		stats: { additions: number; deletions: number };
		onToggle: () => void;
	}

	let { diff, isExpanded, stats, onToggle }: Props = $props();
</script>

<button
	class="flex w-full cursor-pointer items-center gap-3 border-b border-none
        px-4 py-3 text-left transition-colors duration-150
           hover:bg-gh-canvas-subtle"
	style="border-left: 4px solid {getDiffTypeColor(diff.type)}"
	onclick={onToggle}
	type="button"
>
	<span
		class="inline-block w-4 shrink-0 text-[10px]
             transition-transform duration-200 {!isExpanded ? '-rotate-90' : ''}"
	>
		<ChevronDown size={16} />
	</span>

	<div class="flex min-w-0 flex-1 items-center gap-3">
		<span
			class="overflow-hidden font-mono text-sm font-semibold text-ellipsis
                   whitespace-nowrap"
		>
			{#if diff.type === 'rename'}
				<span class="text-red-500 line-through">{diff.oldPath}</span>
				<span class="mx-1">→</span>
				<span class="text-green-500">{diff.newPath}</span>
			{:else}
				{getFilePath(diff)}
			{/if}
		</span>
		<span
			class="shrink-0 rounded-xl px-2 py-0.5 text-[11px] font-semibold uppercase"
			style="background: {getDiffTypeColor(diff.type)}"
		>
			{getFileTypeLabel(diff.type)}
		</span>
	</div>

	<div class="flex shrink-0 gap-2 font-mono text-xs">
		{#if stats.additions > 0}
			<span class="font-semibold text-gh-success-fg">+{stats.additions}</span>
		{/if}
		{#if stats.deletions > 0}
			<span class="font-semibold text-gh-danger-fg">-{stats.deletions}</span>
		{/if}
	</div>

	{#if diff.isBinary}
		<span class="shrink-0 text-xs">Binary file</span>
	{/if}

	{#if diff.similarity !== undefined}
		<span class="shrink-0 text-xs">Similarity: {diff.similarity}%</span>
	{/if}
</button>
