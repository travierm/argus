<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto flex max-w-4xl flex-col p-8">
	<h1 class="text-2xl font-bold">Generate Code Intelligence</h1>
	<p class="mt-4 text-[#8b949e]">AI-powered code review analysis will go here</p>
	<div class="mt-8 text-sm text-[#8b949e]">
		<p>Repository: <span class="">{data.repo}</span></p>
		<p>Branch: <span class="">{data.branch}</span></p>
		<p>UUID: <span class="font-mono">{data.uuid}</span></p>
	</div>
</div>
