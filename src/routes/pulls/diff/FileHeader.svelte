<script lang="ts">
    import type { DiffInfo } from "$lib/diffParser";
    import { getFileTypeLabel, getFileTypeColor } from "./diffViewerUtils";
  
    interface Props {
      diff: DiffInfo;
      isExpanded: boolean;
      stats: { additions: number; deletions: number };
      onToggle: () => void;
    }
  
    let { diff, isExpanded, stats, onToggle }: Props = $props();
  </script>
  
  <button
    class="w-full py-3 px-4 bg-[#161b22] border-none border-b border-[#30363d] 
           flex items-center gap-3 cursor-pointer text-left transition-colors duration-150 
           hover:bg-[#1c2128]"
    style="border-left: 4px solid {getFileTypeColor(diff.type)}"
    onclick={onToggle}
    type="button"
  >
    <span 
      class="text-[10px] text-[#8b949e] transition-transform duration-200 inline-block 
             w-4 shrink-0 {isExpanded ? 'rotate-90' : ''}"
    >
      ▶
    </span>
    
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <span class="font-mono text-sm font-semibold text-[#f0f6fc] overflow-hidden 
                   text-ellipsis whitespace-nowrap">
        {#if diff.type === 'rename'}
          <span class="text-red-500 line-through">{diff.oldPath}</span>
          <span class="text-[#8b949e] mx-1">→</span>
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
        class="py-0.5 px-2 rounded-xl text-[11px] font-semibold text-white uppercase shrink-0"
        style="background: {getFileTypeColor(diff.type)}"
      >
        {getFileTypeLabel(diff.type)}
      </span>
    </div>
    
    <div class="flex gap-2 text-xs font-mono shrink-0">
      {#if stats.additions > 0}
        <span class="text-[#3fb950] font-semibold">+{stats.additions}</span>
      {/if}
      {#if stats.deletions > 0}
        <span class="text-[#f85149] font-semibold">-{stats.deletions}</span>
      {/if}
    </div>
    
    {#if diff.isBinary}
      <span class="text-xs text-[#8b949e] shrink-0">Binary file</span>
    {/if}
    
    {#if diff.similarity !== undefined}
      <span class="text-xs text-[#8b949e] shrink-0">Similarity: {diff.similarity}%</span>
    {/if}
  </button>
  