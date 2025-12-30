<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Puzzle, Eye } from '@lucide/svelte';
	let { children } = $props();
</script>

<div class="mt-4 w-full">
	<div class="mx-auto flex flex-col gap-2">
		<!-- Header -->
		<div
			class="flex justify-between border-b-2 border-neutral-200/70 px-4 pb-4 dark:border-white/5"
		>
			<a class="flex items-center gap-2 text-2xl font-bold" href="/">
				<span class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
					<Eye class="h-6 w-6" style="stroke: url(#eye-gradient); fill: none;" />
				</span>
				<svg width="0" height="0" style="position: absolute;">
					<defs>
						<linearGradient id="eye-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stop-color="#fb923c" />
							<stop offset="100%" stop-color="#ea580c" />
						</linearGradient>
					</defs>
				</svg>
				<span
					class="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text tracking-wider text-transparent"
					>ARGUS</span
				>
			</a>

			<div class="flex items-center">
				<a href="/components" class="btn btn-ghost btn-sm max-w-15 text-green-600">
					<Puzzle />
				</a>
				<ThemeToggle />
			</div>
		</div>

		<div class="">
			{@render children()}
		</div>
	</div>
</div>
