<script lang="ts">
	import type { DiffInfo } from '$lib/diffParser';
	import fuzzysort from 'fuzzysort';
	import { Search } from '@lucide/svelte';
	import { buildFileTree } from './fileTreeUtils';
	import FileTreeNode from './FileTreeNode.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		diffs: DiffInfo[];
		onFileClick: (index: number) => void;
	};

	let { diffs, onFileClick }: Props = $props();

	let searchQuery = $state('');
	const searchableFiles = $derived(
		diffs.map((diff, index) => {
			return {
				diff,
				index,
				name: diff.name || '',
				highlight: null
			};
		})
	);
	const collapsedFolders = $derived(new SvelteSet<string>());

	const filteredFiles = $derived.by(() => {
		if (!searchQuery.trim()) {
			return searchableFiles;
		}

		const results = fuzzysort.go(searchQuery, searchableFiles, {
			key: 'name',
			threshold: 0.5
		});

		return results.map((result) => ({
			diff: result.obj.diff,
			index: result.obj.index,
			highlight: result.highlight()
		}));
	});

	const fileTree = $derived(buildFileTree(filteredFiles));

	function toggleFolder(path: string) {
		if (collapsedFolders.has(path)) {
			collapsedFolders.delete(path);
		} else {
			collapsedFolders.add(path);
		}
	}
</script>

<div class="flex h-full flex-col border-r">
	<!-- Header -->
	<div class="border-b p-2">
		<div class="mb-2 flex items-center justify-between">
			<h2 class="text-sm font-semibold text-[#f0f6fc]">Files</h2>
		</div>

		<div class="relative">
			<div class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
				<Search size={14} class="text-[#8b949e]" />
			</div>
			<input
				type="text"
				placeholder="Search files..."
				bind:value={searchQuery}
				class="w-full rounded border py-1.5 pr-3 pl-9 text-sm text-[#f0f6fc] placeholder-[#6e7681] transition-colors focus:border-[#58a6ff] focus:outline-none"
			/>
		</div>

		<div
			class="mt-2 overflow-hidden text-xs text-nowrap text-ellipsis whitespace-nowrap text-[#6e7681]"
		>
			{filteredFiles.length}
			{filteredFiles.length === 1 ? 'file' : 'files'}
			{#if searchQuery.trim()}
				<span class="text-[#8b949e]">matching "{searchQuery}"</span>
			{/if}
		</div>
	</div>

	<!-- File Tree -->
	<div class="flex-1 overflow-y-auto py-2">
		{#if filteredFiles.length === 0}
			<div class="p-4 text-center text-sm">No files found</div>
		{:else}
			<FileTreeNode
				node={fileTree}
				depth={0}
				{collapsedFolders}
				{onFileClick}
				onToggleFolder={toggleFolder}
			/>
		{/if}
	</div>
</div>

<style>
	/* Style for fuzzysort highlights */
	:global(b) {
		background-color: rgba(88, 166, 255, 0.3);
		color: #58a6ff;
		font-weight: 600;
	}
</style>
