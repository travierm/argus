<script lang="ts">
	import parseDiff, { type DiffInfo } from '$lib/diffParser';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { onMount, onDestroy, untrack } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import FileHeader from '$lib/components/review/FileHeader.svelte';
	import HunkDisplay from '$lib/components/review/HunkDisplay.svelte';
	import VirtualizedFileContent from '$lib/components/review/VirtualizedFileContent.svelte';
	import FileExplorer from '$lib/components/review/FileExplorer/FileExplorer.svelte';
	import ShikiService from '$lib/shikiService';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Check if debug mode is enabled via query param
	const isDebugMode = $derived(page.url.searchParams.has('debug'));

	const LARGE_FILE_THRESHOLD = 1000;

	let diffs = $state<DiffInfo[]>([]);
	let isLoading = $state(false);
	let parseTime = $state(0);
	let renderTime = $state(0);
	let highlightTime = $state(0);
	let fileHighlightTimes = $state(new Map<number, number>());
	let shikiReady = $state(false);
	let highlightedContent = $state(
		new SvelteMap<number, SvelteMap<number, SvelteMap<number, string>>>()
	);
	let highlightingQueue = $state(new SvelteSet<number>());
	let highlightedFiles = $state(new SvelteSet<number>()); // Track which files have been highlighted

	const shiki = ShikiService.getInstance();
	const componentStartTime = performance.now();

	onMount(async () => {
		try {
			await shiki.init();
			shikiReady = true;
			renderTime = performance.now() - componentStartTime;

			// If diffs are already loaded, start highlighting after a short delay
			if (diffs.length > 0) {
				setTimeout(() => {
					const initialFilesToHighlight = Math.min(5, diffs.length);
					for (let i = 0; i < initialFilesToHighlight; i++) {
						highlightFile(i);
					}
				}, 100);
			}
		} catch (error) {
			console.error('Failed to initialize Shiki:', error);
		}
	});

	// Parse diff when data is available
	$effect(() => {
		if (data?.diff) {
			isLoading = true;
			const startTime = performance.now();
			const parsedDiffs = parseDiff.parse(data.diff);
			parseTime = performance.now() - startTime;

			// Update diffs and expandedFiles
			diffs = parsedDiffs;
			expandedFiles = new SvelteSet(parsedDiffs.map((_, i) => i));

			// Reset highlighting tracking for new diffs
			highlightedContent.clear();
			highlightedFiles.clear();
			highlightingQueue.clear();
			highlightTime = 0;
			fileHighlightTimes.clear();

			isLoading = false;

			// Start highlighting initially visible files after a short delay
			if (shikiReady && parsedDiffs.length > 0) {
				setTimeout(() => {
					const initialFilesToHighlight = Math.min(5, parsedDiffs.length);
					for (let i = 0; i < initialFilesToHighlight; i++) {
						highlightFile(i);
					}
				}, 100);
			}
		}
	});

	onDestroy(async () => {
		await shiki.dispose();
	});

	async function highlightFile(fileIdx: number) {
		// Check if already highlighted or in progress
		if (!shikiReady || highlightedFiles.has(fileIdx) || highlightingQueue.has(fileIdx)) {
			return;
		}

		const diff = diffs[fileIdx];
		if (!diff || diff.isBinary) return;

		// Mark as in progress
		highlightingQueue.add(fileIdx);

		const fileStartTime = performance.now();
		const fileExt = diff.type === 'delete' ? diff.oldFileExt : diff.newFileExt || 'txt';
		const fileMap = new SvelteMap<number, SvelteMap<number, string>>();

		for (let hunkIdx = 0; hunkIdx < diff.hunks.length; hunkIdx++) {
			const hunk = diff.hunks[hunkIdx];
			const hunkMap = new SvelteMap<number, string>();

			// Collect all lines in the hunk for context-aware highlighting
			const hunkContent = hunk.changes.map((c) => c.content).join('\n');

			try {
				// Highlight the entire hunk at once to preserve context
				const highlighted = await shiki.highlight(hunkContent, fileExt);
				const highlightedLines = highlighted.split('\n');

				// Map each highlighted line back to its change
				for (let changeIdx = 0; changeIdx < hunk.changes.length; changeIdx++) {
					hunkMap.set(changeIdx, highlightedLines[changeIdx] || '');
				}
			} catch (error) {
				console.error('Error highlighting hunk:', error);
				// Fallback to individual line highlighting
				for (let changeIdx = 0; changeIdx < hunk.changes.length; changeIdx++) {
					const change = hunk.changes[changeIdx];
					try {
						const highlighted = await shiki.highlight(change.content, fileExt);
						hunkMap.set(changeIdx, highlighted);
					} catch (error) {
						console.error('Error highlighting line:', error);
					}
				}
			}

			fileMap.set(hunkIdx, hunkMap);
		}

		const fileHighlightDuration = performance.now() - fileStartTime;
		fileHighlightTimes.set(fileIdx, fileHighlightDuration);
		highlightTime += fileHighlightDuration;

		highlightedContent.set(fileIdx, fileMap);
		highlightedFiles.add(fileIdx); // Mark as completed
		highlightingQueue.delete(fileIdx);
	}

	let expandedFiles = $state(new SvelteSet<number>());
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
					overscan: 30,
					measureElement: (element) => {
						if (!element) return 0;
						return element.getBoundingClientRect().height;
					}
				})
			: null
	);

	const items = $derived($virtualizer?.getVirtualItems() ?? []);

	// Effect for measuring and highlighting visible elements
	$effect(() => {
		if (items.length > 0 && $virtualizer) {
			items.forEach((item) => {
				const el = virtualItemEls[item.index];
				if (el) {
					// Measure element for accurate sizing
					$virtualizer.measureElement(el);
					// Trigger highlighting for visible file (untracked to prevent effect re-runs)
					untrack(() => highlightFile(item.index));
				}
			});
		}
	});

	function toggleFile(index: number) {
		if (expandedFiles.has(index)) {
			expandedFiles.delete(index);
		} else {
			expandedFiles.add(index);
			// Trigger highlighting when file is expanded (deferred to avoid infinite loops)
			setTimeout(() => highlightFile(index), 0);
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
			// Trigger highlighting when file is expanded (deferred to avoid infinite loops)
			setTimeout(() => highlightFile(fileIndex), 0);
		}

		// Scroll to the file
		$virtualizer.scrollToIndex(fileIndex, {
			align: 'start',
			behavior: 'auto'
		});
	}
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="sticky top-0 z-10 flex flex-col gap-4 border-b">
		<div class="flex items-center justify-end pt-4 pr-8 pb-2">
			<div class="flex items-center gap-4 text-sm">
				{#if !isLoading}
					<span>{diffs.length} file{diffs.length !== 1 ? 's' : ''} changed</span>
					<button
						onclick={() => {
							if (expandedFiles.size === diffs.length) {
								expandedFiles.clear();
							} else {
								const filesToHighlight: number[] = [];
								diffs.forEach((_, i) => {
									if (!expandedFiles.has(i)) {
										expandedFiles.add(i);
										filesToHighlight.push(i);
									}
								});
								// Schedule highlighting after state update
								setTimeout(() => {
									filesToHighlight.forEach((i) => highlightFile(i));
								}, 0);
							}
						}}
						class="rounded border px-3 py-1 text-xs transition-colors hover:bg-[#30363d]"
					>
						{expandedFiles.size === diffs.length ? 'Collapse All' : 'Expand All'}
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content: File Explorer + Diff View -->
	<div class="flex flex-1 overflow-hidden">
		<!-- File Explorer Sidebar -->
		{#if diffs.length > 0}
			<div class="w-80 shrink-0">
				<FileExplorer {diffs} onFileClick={scrollToFile} />
			</div>
		{/if}

		<!-- Diff Content -->
		<div class="flex-1 overflow-auto p-5" bind:this={scrollElement}>
			{#if isLoading}
				<div class="flex h-full flex-col items-center justify-center gap-5">
					<div class="h-10 w-10 animate-spin rounded-full border-[3px] border-t-[#58a6ff]"></div>
					<p class="text-sm text-[#8b949e]">Parsing diff in background...</p>
				</div>
			{:else if diffs.length === 0}
				<div class="flex h-full flex-col items-center justify-center gap-5">
					<p class="text-lg text-[#8b949e]">No changes found</p>
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
							<div class="overflow-hidden rounded-md border contain-[layout_style_paint]">
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
										<div>
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

	<!-- Debug Performance Banner -->
	{#if isDebugMode}
		<div class="fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3 shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-6 text-sm">
					<span class="font-semibold text-[#58a6ff]">Performance Metrics</span>
					{#if renderTime > 0}
						<div class="flex flex-col">
							<span class="text-xs text-[#8b949e]">Render Time</span>
							<span class="font-mono text-[#e6edf3]">{renderTime.toFixed(2)}ms</span>
						</div>
					{/if}
					{#if parseTime > 0}
						<div class="flex flex-col">
							<span class="text-xs text-[#8b949e]">Parse Time</span>
							<span class="font-mono text-[#e6edf3]">{parseTime.toFixed(2)}ms</span>
						</div>
					{/if}
					{#if highlightTime > 0}
						<div class="flex flex-col">
							<span class="text-xs text-[#8b949e]">Highlight Time</span>
							<span class="font-mono text-[#58a6ff]">{highlightTime.toFixed(2)}ms</span>
						</div>
					{/if}
					<div class="flex flex-col">
						<span class="text-xs text-[#8b949e]">Files Highlighted</span>
						<span class="font-mono text-[#e6edf3]">{highlightedFiles.size}/{diffs.length}</span>
					</div>
					{#if highlightingQueue.size > 0}
						<div class="flex items-center gap-2">
							<div class="h-2 w-2 animate-pulse rounded-full bg-[#f0883e]"></div>
							<span class="text-xs text-[#f0883e]"
								>Highlighting {highlightingQueue.size} file{highlightingQueue.size !== 1
									? 's'
									: ''}...</span
							>
						</div>
					{/if}
				</div>
				<button
					onclick={() => {
						const params = new URLSearchParams(page.url.searchParams);
						params.delete('debug');
						const newUrl = params.toString()
							? `${page.url.pathname}?${params.toString()}`
							: page.url.pathname;
						goto(newUrl, { replaceState: true, noScroll: true });
					}}
					class="rounded border px-3 py-1 text-xs transition-colors hover:bg-[#30363d] hover:text-[#e6edf3]"
				>
					Hide Debug
				</button>
			</div>
		</div>
	{/if}
</div>
