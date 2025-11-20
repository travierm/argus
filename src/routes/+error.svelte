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

<div class="hero min-h-[80vh] from-base-100 to-base-200">
	<div class="hero-content text-center">
		<div class="card-body p-8 md:p-12">
			<!-- Animated Icon -->
			<div class="mb-6 flex justify-center">
				<div class="rounded-full bg-base-200 p-6">
					{#if status === 404}
						<FileQuestionMark class="h-20 w-20 {errorConfig.color}" />
					{:else}
						<ServerCrash class="h-20 w-20 {errorConfig.color}" />
					{/if}
				</div>
			</div>

			<!-- Error Code -->
			<div class="mb-4">
				<h1 class="text-7xl font-black md:text-8xl {errorConfig.color} mb-2 tracking-tight">
					{errorConfig.title}
				</h1>
				<h2 class="text-2xl font-bold text-base-content/80 md:text-3xl">
					{errorConfig.subtitle}
				</h2>
			</div>

			<!-- Error Message -->
			<div class="divider my-6"></div>

			<p class="mx-auto mb-8 max-w-md text-lg text-base-content/70 md:text-xl">
				{message}
			</p>

			<!-- Action Buttons -->
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a href="/" class="btn w-full gap-2 btn-lg btn-primary sm:w-auto">
					<HouseIcon class="icon-sm" />
					Go Home
				</a>
				<button
					onclick={() => window.history.back()}
					class="btn w-full gap-2 btn-ghost btn-lg sm:w-auto"
				>
					<ArrowLeft class="icon-sm" />
					Go Back
				</button>
			</div>

			<!-- Additional Help Text -->
			{#if status === 404}
				<div class="mt-8 text-sm text-base-content/50">
					The page you're looking for doesn't exist or has been moved.
				</div>
			{:else}
				<div class="mt-8 text-sm text-base-content/50">
					If this problem persists, please contact support.
				</div>
			{/if}
		</div>
	</div>
</div>
