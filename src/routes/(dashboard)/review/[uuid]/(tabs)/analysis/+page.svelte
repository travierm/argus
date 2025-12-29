<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full flex-col items-center justify-center p-8">
	<h1 class="text-2xl font-bold text-[#e6edf3]">Analysis View</h1>
	<p class="mt-4 text-[#8b949e]">AI-powered code review analysis will go here</p>
	<div class="mt-8 text-sm text-[#8b949e]">
		<p>Repository: <span class="text-[#e6edf3]">{data.repo}</span></p>
		<p>Branch: <span class="text-[#e6edf3]">{data.branch}</span></p>
		<p>UUID: <span class="font-mono text-[#e6edf3]">{data.uuid}</span></p>
	</div>
</div>
