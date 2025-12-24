<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-xl">Repos</h1>

	{#each data.repos as repo (repo.name)}
		<div class="bg-base-200 flex w-64 items-center justify-between rounded p-4">
			<h4 class="text-xl">{repo.name}</h4>
			<button class="btn btn-primary">View</button>
		</div>
	{/each}
</div>
