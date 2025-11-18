<script lang="ts">
	import { getRepoByName } from '$lib/data/repos';
	import { onMount } from 'svelte';

	let { repos, initialRepo = '', initialBranch = '', preserveDebug = false } = $props();

	let selectedRepo = $state(initialRepo);
	let selectedBranch = $state(initialBranch);
	let branches: Array<{ name: string; isRemote: boolean; isCurrent: boolean }> = $state([]);
	let loading = $state(false);

	// Load branches if we have an initial repo
	onMount(() => {
		if (initialRepo) {
			fetchBranches(initialRepo);
		}
	});

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
		selectedRepo = target.value;
		selectedBranch = '';
		fetchBranches(target.value);
	}
</script>

<form
	method="POST"
	action={preserveDebug ? '?/getDiff&debug' : '?/getDiff'}
	class="flex items-end gap-3"
>
	<div class="flex flex-col gap-1.5">
		<label for="repo" class="text-xs font-medium text-[#8b949e]">Repository</label>
		<select
			id="repo"
			name="repo"
			bind:value={selectedRepo}
			onchange={handleRepoChange}
			class="rounded border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-[#f0f6fc] transition-colors hover:border-[#58a6ff] focus:border-[#58a6ff] focus:outline-none"
		>
			<option value="" disabled>Select a repo</option>
			{#each repos as repo (repo.name)}
				<option value={repo.name}>{repo.name}</option>
			{/each}
		</select>
	</div>

	<div class="flex flex-col gap-1.5">
		<label for="branch" class="min-w-[168px] text-xs font-medium text-[#8b949e]">Branch</label>
		<select
			id="branch"
			name="branch"
			bind:value={selectedBranch}
			disabled={!selectedRepo || loading}
			class="rounded border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-[#f0f6fc] transition-colors hover:border-[#58a6ff] focus:border-[#58a6ff] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if loading}
				<option>Loading branches...</option>
			{:else if branches.length === 0}
				<option value="">No branches available</option>
			{:else}
				<option value="">Select a branch</option>
				{#each branches as branch (branch.name)}
					<option value={branch.name}>{branch.name}</option>
				{/each}
			{/if}
		</select>
	</div>

	<button
		type="submit"
		disabled={!selectedRepo || !selectedBranch}
		class="rounded border border-[#30363d] bg-[#238636] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:bg-[#21262d] disabled:text-[#6e7681]"
	>
		Review Code
	</button>
</form>
