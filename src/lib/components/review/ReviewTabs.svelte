<script>
	import { page } from '$app/stores';

	const pathname = $derived($page.url.pathname);

	// Extract UUID and current tab from path
	// Path format: /review/[uuid]/[tab] or /review/[uuid]
	const pathSegments = $derived(pathname.split('/').filter(Boolean));
	const uuid = $derived(pathSegments[1] || '');
	const currentTab = $derived(pathSegments[2] || 'changes');

	// Build base URL for tab links
	const baseUrl = $derived(uuid ? `/review/${uuid}` : '/review');

	const tabs = [
		{ id: 'analysis', label: 'Analysis' },
		{ id: 'changes', label: 'Changes' },
		{ id: 'commits', label: 'Commits' }
	];
</script>

<ul class="-mb-px flex flex-wrap text-center text-sm font-medium" id="default-tab" role="tablist">
	{#each tabs as tab}
		<li class="me-2" role="presentation">
			<a
				href="{baseUrl}/{tab.id}"
				class="rounded-t-base inline-block p-4 {currentTab === tab.id
					? 'border-b-2 border-[#58a6ff] text-[#58a6ff]'
					: 'text-[#8b949e] hover:text-[#e6edf3]'}"
				role="tab"
				aria-controls={tab.id}
				aria-selected={currentTab === tab.id}
			>
				{tab.label}
			</a>
		</li>
	{/each}
</ul>
