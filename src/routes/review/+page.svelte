<script lang="ts">
	import BranchReviewForm from '../../views/BranchReviewForm.svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-xl">Code Review</h1>

	<BranchReviewForm repos={data.repos} />

	{#if form && form.diff}
		<div class="h-200 w-500 overflow-scroll">
			
		</div>
	{/if}
</div>
