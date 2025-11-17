<script lang="ts">
	import type { DiffInfo } from '$lib/diffParser';
	import { getFileTypeLabel, getFileTypeColor } from './diffViewerUtils';

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
           border-[#30363d] bg-[#161b22] px-4 py-3 text-left transition-colors duration-150
           hover:bg-[#1c2128]"
	style="border-left: 4px solid {getFileTypeColor(diff.type)}"
	onclick={onToggle}
	type="button"
>
	<span
		class="inline-block w-4 shrink-0 text-[10px] text-[#8b949e]
             transition-transform duration-200 {isExpanded ? 'rotate-90' : ''}"
	>
		▶
	</span>

	<div class="flex min-w-0 flex-1 items-center gap-3">
		<span
			class="overflow-hidden font-mono text-sm font-semibold text-ellipsis
                   whitespace-nowrap text-[#f0f6fc]"
		>
			{#if diff.type === 'rename'}
				<span class="text-red-500 line-through">{diff.oldPath}</span>
				<span class="mx-1 text-[#8b949e]">→</span>
				<span class="text-green-500">{diff.newPath}</span>
			{:else if diff.type === 'add'}
				{diff.newPath}
			{:else if diff.type === 'delete'}
				{diff.oldPath}
			{:else}
				{diff.newPath || diff.oldPath}
			{/if}
		</span>
		<span
			class="shrink-0 rounded-xl px-2 py-0.5 text-[11px] font-semibold text-white uppercase"
			style="background: {getFileTypeColor(diff.type)}"
		>
			{getFileTypeLabel(diff.type)}
		</span>
	</div>

	<div class="flex shrink-0 gap-2 font-mono text-xs">
		{#if stats.additions > 0}
			<span class="font-semibold text-[#3fb950]">+{stats.additions}</span>
		{/if}
		{#if stats.deletions > 0}
			<span class="font-semibold text-[#f85149]">-{stats.deletions}</span>
		{/if}
	</div>

	{#if diff.isBinary}
		<span class="shrink-0 text-xs text-[#8b949e]">Binary file</span>
	{/if}

	{#if diff.similarity !== undefined}
		<span class="shrink-0 text-xs text-[#8b949e]">Similarity: {diff.similarity}%</span>
	{/if}
</button>
