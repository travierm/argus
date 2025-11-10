<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedRepoPath = $state('');
	let branches: Array<{ name: string; isRemote: boolean; isCurrent: boolean }> = $state([]);
	let loading = $state(false);

	async function fetchBranches(repoPath: string) {
		if (!repoPath) return;

		loading = true;
		try {
			const response = await fetch(`/api/branches?path=${encodeURIComponent(repoPath)}`);
			const result = await response.json();

			if (response.ok) {
				branches = result.branches;
			} else {
				console.error('Error fetching branches:', result.error);
				branches = [];
			}
		} catch (error) {
			console.error('Failed to fetch branches:', error);
			branches = [];
		} finally {
			loading = false;
		}
	}

	function handleRepoChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedRepoPath = target.value;
		fetchBranches(selectedRepoPath);
	}
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-xl">Code Review</h1>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Code Repo</legend>
		<select class="select" onchange={handleRepoChange}>
			<option disabled selected>Pick a Repo</option>
			{#each data.repos as repo (repo.name)}
				<option value={repo.path}>{repo.name}</option>
			{/each}
		</select>
	</fieldset>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Branch</legend>
		<select class="select">
			{#if loading}
				<option>Loading branches...</option>
			{:else if branches.length === 0}
				<option>No branches available</option>
			{:else}
				<option value="">Select a branch...</option>
				{#each branches as branch (branch.name)}
					<option value={branch.name}>{branch.name}</option>
				{/each}
			{/if}
		</select>
	</fieldset>
</div>
