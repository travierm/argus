<script lang="ts">
	import ParentPage from '../+page.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Transform loaded data to match parent page's expected props structure
	const parentProps = $derived({
		data: {
			repos: data.repos
		},
		form: {
			diff: data.diff,
			repo: data.repo,
			branch: data.branch
		}
	} as any);
</script>

<ParentPage {...parentProps} />
