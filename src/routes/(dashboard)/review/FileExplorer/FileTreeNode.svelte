<script lang="ts">
	import type { TreeNode } from './fileTreeUtils';
	import { getDiffTypeColor } from '@routes/(dashboard)/review/diffViewerUtils';
	import {
		ChevronDown,
		FileDiff,
		FileInput,
		FilePlus,
		FileQuestionMark,
		Files,
		FileX,
		Folder
	} from '@lucide/svelte';
	import Self from './FileTreeNode.svelte';
	import type { DiffFileType } from '$lib/diffParser';

	type Props = {
		node: TreeNode;
		depth: number;
		collapsedFolders: Set<string>;
		onFileClick: (index: number) => void;
		onToggleFolder: (path: string) => void;
	};

	let { node, depth, collapsedFolders, onFileClick, onToggleFolder }: Props = $props();

	function getFileIcon(type?: DiffFileType) {
		if (!type) return FileQuestionMark;

		const Icons: Record<DiffFileType, typeof FilePlus> = {
			add: FilePlus,
			delete: FileX,
			modify: FileDiff,
			rename: FileInput,
			copy: Files
		};

		return Icons[type] || FileQuestionMark;
	}
</script>

{#if node.children}
	{#each node.children as child}
		{@const childCollapsed = collapsedFolders.has(child.path)}

		{#if child.type === 'folder'}
			<button
				onclick={() => onToggleFolder(child.path)}
				class="group flex w-full items-center gap-1 py-0.5 pr-2 pl-1 text-left text-sm transition-colors hover:bg-[#21262d]"
				style="padding-left: {depth * 12 + 4}px"
			>
				<div class="shrink-0">
					<ChevronDown
						size={16}
						class="text-[#8b949e] 
             transition-transform duration-200 {childCollapsed ? '-rotate-90' : ''}"
					/>
				</div>
				<div class="shrink-0">
					<Folder size={16} class="text-[#8b949e]" />
				</div>
				<span class="truncate text-[#e6edf3]">{child.name}</span>
			</button>

			{#if !childCollapsed}
				<Self node={child} depth={depth + 1} {collapsedFolders} {onFileClick} {onToggleFolder} />
			{/if}
		{:else if child.type === 'file' && child.diff && child.index !== undefined}
			{@const Icon = getFileIcon(child.diff?.type)}
			{@const iconColor = getDiffTypeColor(child.diff?.type)}

			<button
				onclick={() => child.index !== undefined && onFileClick(child.index)}
				class="group flex w-full items-center gap-1.5 py-0.5 pr-2 pl-1 text-left transition-colors hover:bg-[#21262d]"
				style="padding-left: {depth * 12 + 20}px"
			>
				<div class="shrink-0">
					<Icon size={16} style="color: {iconColor}" />
				</div>
				{#if child.highlight}
					<!-- Search results with highlights -->
					<span class="truncate text-sm text-[#e6edf3]">
						{@html child.highlight}
					</span>
				{:else}
					<!-- Regular file name -->
					<span class="truncate text-sm text-[#e6edf3]">{child.name}</span>
				{/if}
			</button>
		{/if}
	{/each}
{/if}
