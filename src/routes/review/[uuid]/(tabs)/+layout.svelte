<script lang="ts">
	import type { LayoutData } from './$types';
	import Tabs from './tabs.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<svelte:head>
	<title>{data.branch}</title>
</svelte:head>

<div class="flex flex-col">
	<!-- Header with tabs -->
	<div class="flex flex-col gap-4 border-b px-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="text-lg font-semibold">{data.repo}</h1>
				<p class="text-sm">{data.branch}</p>
			</div>

			<div class="pt-8">
				<Tabs />
			</div>
		</div>
	</div>

	<!-- Tab content -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
