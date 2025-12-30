<script lang="ts">
	import ReviewTabs from '$lib/components/review/ReviewTabs.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="flex h-screen flex-col">
	<!-- Header with tabs -->
	<div class="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#30363d] px-4">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-1">
				<h1 class="text-lg font-semibold text-[#e6edf3]">{data.repo}</h1>
				<p class="text-sm text-[#8b949e]">{data.branch}</p>
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
