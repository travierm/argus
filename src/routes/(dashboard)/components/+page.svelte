<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
</script>

<div class="flex min-h-screen flex-col gap-8">
	<!-- Buttons -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h1 class="text-xl font-bold text-gray-900 dark:text-white">Buttons</h1>
		</div>

		<code class="flew-grow">class="btn btn-primary"</code>
		<div class="flex flex-wrap gap-2">
			<button class="btn btn-primary max-w-25">Primary</button>
			<button class="btn btn-secondary max-w-25">Secondary</button>
			<button class="btn btn-success max-w-25">Success</button>
			<button class="btn btn-danger max-w-25">Danger</button>
			<button class="btn btn-warning max-w-25">Warning</button>
			<button class="btn btn-dark max-w-25">Dark</button>
			<button class="btn btn-outline max-w-25">Outline</button>
			<button class="btn btn-ghost max-w-25">Ghost</button>
		</div>
	</div>

	<!-- Cards -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h1 class="text-xl font-bold text-gray-900 dark:text-white">Cards</h1>
		</div>

		<code class="flew-grow">class="card card-title card-body"</code>
		<div class="flex flex-wrap gap-2">
			<div class="card">
				<h1 class="card-title">Title</h1>

				<div class="card-body min-h-[200px] min-w-[200px]">
					<p>Body</p>
				</div>
			</div>
		</div>
	</div>
</div>
