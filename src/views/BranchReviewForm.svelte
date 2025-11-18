<script lang="ts">
	import { getRepoByName } from '$lib/data/repos';

	let { repos } = $props();

	let selectedRepo = $state('');
	let selectedBranch = $state('');
	let branches: Array<{ name: string; isRemote: boolean; isCurrent: boolean }> = $state([]);
	let loading = $state(false);

	async function fetchBranches(repoName: string) {
		if (!repoName) return;

		let repo = getRepoByName(repoName);
		if (!repo) {
			return;
		}

		loading = true;
		try {
			const response = await fetch(`/api/branches?path=${encodeURIComponent(repo.path)}`);
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

		fetchBranches(target.value);
	}
</script>

<form class="flex flex-col gap-4" method="POST" action="?/review">
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Code Repo</legend>
		<select name="repo" bind:value={selectedRepo} class="select" onchange={handleRepoChange}>
			<option disabled selected>Select a Repo</option>
			{#each repos as repo (repo.name)}
				<option value={repo.name}>{repo.name}</option>
			{/each}
		</select>
	</fieldset>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Branch</legend>
		<select name="branch" bind:value={selectedBranch} class="select">
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

	{#if selectedRepo && selectedBranch}
		<button class="btn w-72 btn-primary">Review Code</button>
	{/if}
</form>
