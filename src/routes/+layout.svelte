<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { FolderGit, GitPullRequest, LayoutDashboard, Settings, FileDiff } from '@lucide/svelte';
	import { page } from '$app/state';
	let { children } = $props();

	const currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="drawer min-h-screen lg:drawer-open">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />

	<!-- Main content -->
	<div class="drawer-content flex flex-col">
		<!-- Navbar/Toggle for mobile -->
		<div class="navbar bg-base-300 lg:hidden">
			<label for="my-drawer-3" class="btn btn-square btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="inline-block h-6 w-6 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					></path>
				</svg>
			</label>
		</div>

		<!-- Page content -->
		<div class="flex-1 {!currentPath.includes('/diff') ? 'p-4' : ''}">
			{@render children()}
		</div>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-50 bg-base-200 p-4">
			<li><a href="/"><LayoutDashboard class="icon-sm" /> Dashboard</a></li>
			<li><a href="/review"><GitPullRequest class="icon-sm" />Review Code</a></li>
			<li><a href="/repos"><FolderGit class="icon-sm" /> Repos</a></li>
			<li><a href="/pulls/diff"><FileDiff class="icon-sm" />Diff View</a></li>
			<li><a href="/settings"><Settings class="icon-sm" /> Settings</a></li>
		</ul>
	</div>
</div>
