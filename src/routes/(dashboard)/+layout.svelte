<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Puzzle } from '@lucide/svelte';
	let { children } = $props();
</script>

<div class="mt-4 w-full">
	<div class="mx-auto flex max-w-4xl flex-col gap-2">
		<!-- Header -->
		<div class="card flex justify-between">
			<a class="text-2xl font-bold" href="/">Argus</a>

			<div class="flex items-center">
				<a href="/components" class="btn btn-ghost btn-sm max-w-15 text-green-600">
					<Puzzle />
				</a>
				<ThemeToggle />
			</div>
		</div>
		<!-- <div class="border-b border-gray-300 dark:border-neutral-700"></div> -->

		<div class="mt-4">
			{@render children()}
		</div>
	</div>
</div>
