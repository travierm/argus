<script lang="ts">
  import type { Hunk } from "$lib/diffParser";
  import ChangeRow from "./ChangeRow.svelte";

  interface Props {
    hunk: Hunk;
    highlightedLines?: Map<number, string>;
  }

  let { hunk, highlightedLines }: Props = $props();
</script>

<div class="mb-0">
  <!-- Add hunk header -->
  <div class="py-2 px-4 bg-[#1c2128] text-[#8b949e] font-mono text-xs border-t border-[#30363d]">
    {hunk.content}
  </div>
  
  <div class="flex flex-col">
    {#each hunk.changes as change, idx}
      <ChangeRow 
        {change} 
        highlightedContent={highlightedLines?.get(idx)}
      />
    {/each}
  </div>
</div>

