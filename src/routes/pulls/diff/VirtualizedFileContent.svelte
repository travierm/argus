<script lang="ts">
	import type { DiffInfo, Hunk, Change } from '$lib/diffParser';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import ChangeRow from './ChangeRow.svelte';

	interface Props {
		diff: DiffInfo;
		highlightedContent?: Map<number, Map<number, string>>;
	}

	let { diff, highlightedContent }: Props = $props();

	type VirtualItem =
		| { type: 'hunk-header'; hunk: Hunk; hunkIndex: number }
		| { type: 'change'; change: Change; hunkIndex: number; changeIndex: number };

	const flatItems = $derived.by(() => {
		const items: VirtualItem[] = [];
		diff.hunks.forEach((hunk, hunkIdx) => {
			items.push({ type: 'hunk-header', hunk, hunkIndex: hunkIdx });
			hunk.changes.forEach((change, changeIdx) => {
				items.push({ type: 'change', change, hunkIndex: hunkIdx, changeIndex: changeIdx });
			});
		});
		return items;
	});

	let scrollElement: HTMLDivElement | undefined = $state();
	let virtualItemEls: (HTMLElement | undefined)[] = $state([]);

	const virtualizer = $derived(
		scrollElement
			? createVirtualizer({
					count: flatItems.length,
					getScrollElement: () => scrollElement!,
					estimateSize: (index) => {
						const item = flatItems[index];
						if (item.type === 'hunk-header') {
							return 33; // Hunk header height
						}
						return 24; // Change row height
					},
					overscan: 10,
					measureElement: (element) => {
						if (!element) return 0;
						return element.getBoundingClientRect().height;
					}
				})
			: null
	);

	const items = $derived($virtualizer?.getVirtualItems() ?? []);

	$effect(() => {
		if (virtualItemEls.length && $virtualizer) {
			virtualItemEls.forEach((el) => {
				if (el) $virtualizer?.measureElement(el);
			});
		}
	});
</script>

<div class="h-full max-h-[800px] overflow-auto bg-[#0d1117]" bind:this={scrollElement}>
	{#if virtualizer && $virtualizer}
		<div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
			{#each items as virtualItem (virtualItem.key)}
				{@const item = flatItems[virtualItem.index]}
				<div
					class="will-change-transform"
					style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px);"
					data-index={virtualItem.index}
					bind:this={virtualItemEls[virtualItem.index]}
				>
					{#if item.type === 'hunk-header'}
						<div
							class="border-t border-[#30363d] bg-[#1c2128] px-4 py-2 font-mono text-xs text-[#8b949e]"
						>
							{item.hunk.content}
						</div>
					{:else}
						<ChangeRow
							change={item.change}
							highlightedContent={highlightedContent?.get(item.hunkIndex)?.get(item.changeIndex)}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
