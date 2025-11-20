<script lang="ts">
	import type { Change } from '$lib/diffParser';

	interface Props {
		change: Change;
		highlightedContent?: string;
	}

	let { change, highlightedContent }: Props = $props();
</script>

<div
	class="flex min-h-[20px] font-mono text-xs leading-5
    {change.type === 'insert' ? 'bg-green-500/15 hover:bg-green-500/25' : ''}
    {change.type === 'delete' ? 'bg-red-500/15 hover:bg-red-500/25' : ''}
    {change.type === 'normal' ? 'bg-transparent hover:bg-gray-500/5' : ''}"
>
	<div class="flex min-w-[100px] shrink-0 select-none">
		<span
			class="w-[50px] border-r border-[#30363d] px-2.5 py-0.5 text-right text-[#6e7681]
        {change.type === 'insert' ? 'bg-green-500/10' : ''}
        {change.type === 'delete' ? 'bg-red-500/15 text-[#8b949e]' : ''}"
		>
			{#if change.type === 'delete' || change.type === 'normal'}
				{change.type === 'delete' ? change.lineNumber : change.oldLineNumber}
			{:else}
				&nbsp;
			{/if}
		</span>
		<span
			class="w-[50px] border-r border-[#30363d] px-2.5 py-0.5 text-right text-[#6e7681]
        {change.type === 'insert' ? 'bg-green-500/15 text-[#8b949e]' : ''}
        {change.type === 'delete' ? 'bg-red-500/10' : ''}"
		>
			{#if change.type === 'insert' || change.type === 'normal'}
				{change.type === 'insert' ? change.lineNumber : change.newLineNumber}
			{:else}
				&nbsp;
			{/if}
		</span>
	</div>
	<div class="flex min-w-0 flex-1 py-0.5 pr-2.5">
		<span
			class="shrink-0 px-2 select-none
        {change.type === 'insert' ? 'text-[#3fb950]' : ''}
        {change.type === 'delete' ? 'text-[#f85149]' : ''}"
		>
			{#if change.type === 'insert'}+{:else if change.type === 'delete'}-{:else}&nbsp;{/if}
		</span>
		{#if highlightedContent}
			<span class="min-w-0 flex-1 pr-2.5 wrap-break-word whitespace-pre-wrap [&>span]:inline"
				>{@html highlightedContent}</span
			>
		{:else}
			<span class="min-w-0 flex-1 pr-2.5 wrap-break-word whitespace-pre-wrap">{change.content}</span
			>
		{/if}
	</div>
</div>
