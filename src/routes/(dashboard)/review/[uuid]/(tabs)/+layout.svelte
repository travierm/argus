<script lang="ts">
	import ReviewTabs from '@routes/(dashboard)/review/ReviewTabs.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="flex h-screen flex-col">
	<!-- Header with tabs -->
	<div class="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#30363d] bg-[#0d1117] px-4">
		<div class="flex items-center justify-between pt-4">
			<div class="flex flex-col gap-1">
				<h1 class="text-lg font-semibold text-[#e6edf3]">{data.repo}</h1>
				<p class="text-sm text-[#8b949e]">{data.branch}</p>
			</div>
		</div>
		<ReviewTabs />
	</div>

	<!-- Tab content -->
	<div class="flex-1 overflow-hidden">
		{@render children()}
	</div>
</div>
