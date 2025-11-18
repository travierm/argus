<script lang="ts">
	import diffString from '$lib/assets/large.diff?raw'; // SWAP THIS WITH YOUR DIFF FILE
	import parseDiff, { type DiffInfo } from '$lib/diffParser';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import FileHeader from './FileHeader.svelte';
	import HunkDisplay from './HunkDisplay.svelte';
	import VirtualizedFileContent from './VirtualizedFileContent.svelte';
	import FileExplorer from './FileExplorer/FileExplorer.svelte';
	import ShikiService from '$lib/shikiService';

	const LARGE_FILE_THRESHOLD = 2000;

	let diffs = $state<DiffInfo[]>([]);
	let isLoading = $state(true);
	let parseTime = $state(0);
	let shikiReady = $state(false);
	let highlightedContent = $derived(
		new SvelteMap<number, SvelteMap<number, SvelteMap<number, string>>>()
	);
	let highlightingQueue = $derived(new SvelteSet<number>());

	const shiki = ShikiService.getInstance();

	onMount(async () => {
		const startTime = performance.now();
		diffs = parseDiff.parse(diffString);
		parseTime = performance.now() - startTime;

		diffs.map((_, i) => expandedFiles.add(i));

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

		const fileExt = diff.type === 'delete' ? diff.oldFileExt : diff.newFileExt || 'txt';
		const fileMap = new SvelteMap<number, SvelteMap<number, string>>();

		for (let hunkIdx = 0; hunkIdx < diff.hunks.length; hunkIdx++) {
			const hunk = diff.hunks[hunkIdx];
			const hunkMap = new SvelteMap<number, string>();

			for (let changeIdx = 0; changeIdx < hunk.changes.length; changeIdx++) {
				const change = hunk.changes[changeIdx];
				try {
					const highlighted = await shiki.highlight(change.content, fileExt);
					hunkMap.set(changeIdx, highlighted);
				} catch (error) {
					console.error('Error highlighting line:', error);
				}
			}

			fileMap.set(hunkIdx, hunkMap);
		}

		highlightedContent.set(fileIdx, fileMap);

		highlightingQueue.delete(fileIdx);
	}

	const expandedFiles = $derived(new SvelteSet<number>());
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

						// Large files use virtualized content with max height of 800px
						if (diff.totalLines > LARGE_FILE_THRESHOLD) {
							const contentHeight = Math.min(800, diff.hunks.length * 33 + diff.totalLines * 24);
							return headerSize + contentHeight;
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
		if (expandedFiles.has(index)) {
			expandedFiles.delete(index);
		} else {
			expandedFiles.add(index);
		}
	}

	function getTotalChanges(fileIndex: number): { additions: number; deletions: number } {
		const diff = diffs[fileIndex];
		return { additions: diff.additions, deletions: diff.deletions };
	}

	function scrollToFile(fileIndex: number) {
		if (!virtualizer || !$virtualizer) return;

		// Ensure the file is expanded
		if (!expandedFiles.has(fileIndex)) {
			expandedFiles.add(fileIndex);
		}

		// Scroll to the file
		$virtualizer.scrollToIndex(fileIndex, {
			align: 'start',
			behavior: 'smooth'
		});
	}
</script>

<svelte:head>
	<style>
		body {
			background: #0d1117;
		}
	</style>
</svelte:head>

<div class="flex h-screen flex-col">
	<!-- Header -->
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
							expandedFiles.clear();
						} else {
							diffs.map((_, i) => expandedFiles.add(i));
						}
					}}
					class="rounded border border-[#30363d] bg-[#21262d] px-3 py-1 text-xs transition-colors hover:bg-[#30363d]"
				>
					{expandedFiles.size === diffs.length ? 'Collapse All' : 'Expand All'}
				</button>
			{/if}
		</div>
	</div>

	<!-- Main Content: File Explorer + Diff View -->
	<div class="flex flex-1 overflow-hidden">
		<!-- File Explorer Sidebar -->
		{#if !isLoading}
			<div class="w-80 shrink-0">
				<FileExplorer {diffs} onFileClick={scrollToFile} />
			</div>
		{/if}

		<!-- Diff Content -->
		<div class="flex-1 overflow-auto p-5" bind:this={scrollElement}>
			{#if isLoading}
				<div class="flex h-full flex-col items-center justify-center gap-5">
					<div
						class="h-10 w-10 animate-spin rounded-full border-[3px] border-[#30363d] border-t-[#58a6ff]"
					></div>
					<p class="text-sm text-[#8b949e]">Parsing diff in background...</p>
				</div>
			{:else if virtualizer && $virtualizer}
				<div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
					{#each items as virtualItem (virtualItem.key)}
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
									{#if diff.totalLines > LARGE_FILE_THRESHOLD}
										<VirtualizedFileContent
											{diff}
											highlightedContent={highlightedContent.get(virtualItem.index)}
										/>
									{:else}
										<div class="bg-[#0d1117]">
											{#each diff.hunks as hunk, hunkIdx (virtualItem.key + '-' + hunkIdx)}
												<HunkDisplay
													{hunk}
													parentKey={virtualItem.key + '-' + hunkIdx}
													highlightedLines={highlightedContent.get(virtualItem.index)?.get(hunkIdx)}
												/>
											{/each}
										</div>
									{/if}
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
