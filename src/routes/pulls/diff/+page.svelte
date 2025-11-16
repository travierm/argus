<script lang="ts">
	import diffString from '$lib/assets/large.diff?raw';
	import parseDiff, { type DiffInfo } from '$lib/diffParser';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { onMount, onDestroy } from 'svelte';
	import FileHeader from './FileHeader.svelte';
	import HunkDisplay from './HunkDisplay.svelte';
	import ShikiService from '$lib/shikiService';

	let diffs = $state<DiffInfo[]>([]);
	let isLoading = $state(true);
	let parseTime = $state(0);
	let shikiReady = $state(false);
	let highlightedContent = $state<Map<number, Map<number, Map<number, string>>>>(new Map());
	let highlightingQueue = $state<Set<number>>(new Set());

	const shiki = ShikiService.getInstance();

	onMount(async () => {
		const startTime = performance.now();
		diffs = parseDiff.parse(diffString);
		parseTime = performance.now() - startTime;

		expandedFiles = new Set(diffs.map((_, i) => i));

		isLoading = false;

		try {
			await shiki.init();
			shikiReady = true;
		} catch (error) {
			console.error('Failed to initialize Shiki:', error);
		}
	});

	onDestroy(async () => {
		await shiki.dispose();
	});

	async function highlightFile(fileIdx: number) {
		if (!shikiReady || highlightedContent.has(fileIdx) || highlightingQueue.has(fileIdx)) {
			return;
		}

		const diff = diffs[fileIdx];
		if (!diff || diff.isBinary) return;

		highlightingQueue.add(fileIdx);

		const fileExt = diff.newFileExt || diff.oldFileExt || 'txt';
		const fileMap = new Map<number, Map<number, string>>();

		for (let hunkIdx = 0; hunkIdx < diff.hunks.length; hunkIdx++) {
			const hunk = diff.hunks[hunkIdx];
			const hunkMap = new Map<number, string>();

			for (let changeIdx = 0; changeIdx < hunk.changes.length; changeIdx++) {
				const change = hunk.changes[changeIdx];
				try {
					const highlighted = shiki.highlight(change.content, fileExt);
					hunkMap.set(changeIdx, highlighted);
				} catch (error) {
					console.error('Error highlighting line:', error);
				}
			}

			fileMap.set(hunkIdx, hunkMap);
		}

		const newContent = new Map(highlightedContent);
		newContent.set(fileIdx, fileMap);
		highlightedContent = newContent;

		const newQueue = highlightingQueue;
		highlightingQueue.delete(fileIdx);
		highlightingQueue = newQueue;
	}

	let expandedFiles = $state<Set<number>>(new Set());
	let scrollElement: HTMLDivElement | undefined = $state();
	let virtualItemEls: HTMLElement[] = $state([]);

	const virtualizer = $derived(
		scrollElement
			? createVirtualizer({
					count: diffs.length,
					getScrollElement: () => scrollElement!,
					estimateSize: (index) => {
						const diff = diffs[index];
						const isExpanded = expandedFiles.has(index);
						// FileHeader (60) + Padding (16)
						const headerSize = 60 + 16;

						if (!isExpanded || diff.isBinary) {
							return headerSize;
						}

						//  HunkHeader (33 per hunk) + ChangeRow (24 per change)
						return headerSize + diff.hunks.length * 33 + diff.totalLines * 24;
					},
					overscan: 5,
					measureElement: (element) => {
						if (!element) return 0;
						return element.getBoundingClientRect().height;
					}
				})
			: null
	);

	const items = $derived($virtualizer?.getVirtualItems() ?? []);

	$effect(() => {
		if (virtualItemEls.length) {
			virtualItemEls.forEach((el) => {
				$virtualizer?.measureElement(el);
				if (el?.dataset?.index) {
					highlightFile(parseInt(el.dataset.index!));
				}
			});
		}
	});

	function toggleFile(index: number) {
		const newExpanded = new Set(expandedFiles);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		expandedFiles = newExpanded;
	}

	function getTotalChanges(fileIndex: number): { additions: number; deletions: number } {
		const diff = diffs[fileIndex];
		return { additions: diff.additions, deletions: diff.deletions };
	}
</script>

<svelte:head>
	<style>
		body {
			margin: 0;
			padding: 0;
			font-family:
				-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
			background: #0d1117;
			color: #c9d1d9;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}
	</style>
</svelte:head>

<div
	class="sticky top-0 z-10 flex items-center justify-between border-b border-[#30363d] bg-[#0d1117] p-5"
>
	<h1 class="m-0 text-2xl text-[#f0f6fc]">Diff Viewer</h1>
	<div class="flex items-center gap-4 text-sm text-[#8b949e]">
		{#if !isLoading}
			<span>{diffs.length} file{diffs.length !== 1 ? 's' : ''} changed</span>
			{#if parseTime > 0}
				<span class="text-xs text-[#6e7681]">• Parsed in {parseTime.toFixed(0)}ms</span>
			{/if}
			{#if shikiReady && highlightingQueue.size > 0}
				<span class="text-xs text-[#f0883e]"
					>• Highlighting {highlightingQueue.size} file{highlightingQueue.size !== 1
						? 's'
						: ''}...</span
				>
			{/if}
			<button
				onclick={() => {
					if (expandedFiles.size === diffs.length) {
						expandedFiles = new Set();
					} else {
						expandedFiles = new Set(diffs.map((_, i) => i));
					}
				}}
				class="rounded border border-[#30363d] bg-[#21262d] px-3 py-1 text-xs transition-colors hover:bg-[#30363d]"
			>
				{expandedFiles.size === diffs.length ? 'Collapse All' : 'Expand All'}
			</button>
		{/if}
	</div>
</div>

<div class="h-[calc(100vh-109px)] overflow-auto p-5" bind:this={scrollElement}>
	{#if isLoading}
		<div class="flex h-full flex-col items-center justify-center gap-5">
			<div
				class="h-10 w-10 animate-spin rounded-full border-[3px] border-[#30363d] border-t-[#58a6ff]"
			></div>
			<p class="text-sm text-[#8b949e]">Parsing diff in background...</p>
		</div>
	{:else if virtualizer && $virtualizer}
		<div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
			{#each items as virtualItem}
				{@const diff = diffs[virtualItem.index]}
				{@const isExpanded = expandedFiles.has(virtualItem.index)}
				{@const stats = getTotalChanges(virtualItem.index)}

				<div
					class="pb-4 will-change-transform"
					style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px);"
					data-index={virtualItem.index}
					bind:this={virtualItemEls[virtualItem.index]}
				>
					<div
						class="overflow-hidden rounded-md border border-[#30363d] bg-[#161b22] contain-[layout_style_paint]"
					>
						<FileHeader
							{diff}
							{isExpanded}
							{stats}
							onToggle={() => toggleFile(virtualItem.index)}
						/>

						{#if isExpanded && !diff.isBinary}
							<div class="bg-[#0d1117]">
								{#each diff.hunks as hunk, hunkIdx}
									<HunkDisplay
										{hunk}
										highlightedLines={highlightedContent.get(virtualItem.index)?.get(hunkIdx)}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
