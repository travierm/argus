<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Puzzle } from '@lucide/svelte';
	let { children } = $props();
</script>

<div class="mt-4 w-full">
	<div class="mx-auto flex flex-col gap-2">
		<!-- Header -->
		<div
			class="flex justify-between border-b-2 border-neutral-200/70 px-4 pb-4 dark:border-white/5"
		>
			<a class="text-2xl font-bold" href="/">Argus</a>

			<div class="flex items-center">
				<a href="/components" class="btn btn-ghost btn-sm max-w-15 text-green-600">
					<Puzzle />
				</a>
				<ThemeToggle />
			</div>
		</div>

		<div>
			{@render children()}
		</div>
	</div>
</div>
