<script lang="ts">
	import { page } from '$app/state';
	import { HouseIcon, ArrowLeft, ServerCrash, FileQuestionMark } from '@lucide/svelte';

	const status = $derived(page.status || 500);
	const message = $derived(
		page.error?.message || (status === 404 ? 'Page not found' : 'An unexpected error occurred')
	);

	const errorConfig = $derived(
		status === 404
			? {
					title: '404',
					subtitle: 'Page Not Found',
					color: 'text-warning'
				}
			: {
					title: status.toString(),
					subtitle: 'Something Went Wrong',
					color: 'text-error'
				}
	);
</script>

<div class="flex min-h-[80vh] items-center justify-center">
	<div class="mx-auto max-w-2xl p-8 text-center">
		<!-- Animated Icon -->
		<div class="mb-6 flex justify-center">
			<div class="rounded-full bg-neutral-200 p-6 dark:bg-neutral-800">
				{#if status === 404}
					<FileQuestionMark class="h-20 w-20 {errorConfig.color}" />
				{:else}
					<ServerCrash class="h-20 w-20 {errorConfig.color}" />
				{/if}
			</div>
		</div>

		<!-- Error Code -->
		<div class="mb-4">
			<h1 class="mb-2 text-7xl font-black tracking-tight md:text-8xl {errorConfig.color}">
				{errorConfig.title}
			</h1>
			<h2 class="text-2xl font-bold text-neutral-800 md:text-3xl dark:text-neutral-200">
				{errorConfig.subtitle}
			</h2>
		</div>

		<!-- Error Message -->
		<div class="my-6 border-t border-neutral-300 dark:border-neutral-700"></div>

		<p class="mx-auto mb-8 max-w-md text-lg text-neutral-700 md:text-xl dark:text-neutral-300">
			{message}
		</p>

		<!-- Action Buttons -->
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
			<a href="/" class="btn btn-primary btn-lg w-full gap-2 sm:w-auto">
				<HouseIcon class="icon-sm" />
				Go Home
			</a>
			<button
				onclick={() => window.history.back()}
				class="btn btn-ghost btn-lg w-full gap-2 sm:w-auto"
			>
				<ArrowLeft class="icon-sm" />
				Go Back
			</button>
		</div>

		<!-- Additional Help Text -->
		{#if status === 404}
			<div class="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
				The page you're looking for doesn't exist or has been moved.
			</div>
		{:else}
			<div class="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
				If this problem persists, please contact support.
			</div>
		{/if}
	</div>
</div>
