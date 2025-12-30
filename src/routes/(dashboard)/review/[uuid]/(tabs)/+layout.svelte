<script lang="ts">
	import ReviewTabs from '$lib/components/review/ReviewTabs.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="flex flex-col">
	<!-- Header with tabs -->
	<div class="sticky top-0 z-10 flex flex-col gap-4 border-b px-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="text-lg font-semibold">{data.repo}</h1>
				<p class="text-sm">{data.branch}</p>
			</div>

			<div class="pt-8">
				<ReviewTabs />
			</div>
		</div>
	</div>

	<!-- Tab content -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
