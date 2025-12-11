<script lang="ts">
	import type { PageProps } from './$types';
	import BranchReviewForm from '../../views/BranchReviewForm.svelte';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<style>
		body {
			background: #0d1117;
		}
	</style>
</svelte:head>

<div class="flex h-screen flex-col">
	<!-- Header -->
	<div
		class="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#30363d] bg-[#0d1117] px-4 py-2"
	>
		<div class="flex items-center justify-between">
			<BranchReviewForm
				repos={data.repos}
				initialRepo={form?.repo || ''}
				initialBranch={form?.branch || ''}
				action="test"
				buttonText="Automated Review"
			/>
			<div class="flex items-center gap-4 pt-4 text-sm text-[#8b949e]"></div>
		</div>
	</div>
</div>
