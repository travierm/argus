<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();
</script>

<Modal {open} {onClose} maxWidth="max-w-4xl">
	{#snippet header()}
		<h2 class="text-xl font-bold text-neutral-900 dark:text-white">Example Modal</h2>
	{/snippet}

	{#snippet content()}
		<div class="space-y-4">
			<p class="text-neutral-700 dark:text-neutral-300">
				This is an example of an extended modal component. It wraps the base Modal component and
				sets a custom max-width of <code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-4xl</code>.
			</p>

			<p class="text-neutral-700 dark:text-neutral-300">
				You can create your own modal components by following this pattern:
			</p>

			<ul class="list-inside list-disc space-y-2 text-neutral-700 dark:text-neutral-300">
				<li>Import the base Modal component</li>
				<li>Define your own Props interface with <code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">open</code> and <code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">onClose</code></li>
				<li>Add any custom props you need</li>
				<li>Set the <code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">maxWidth</code> to your desired Tailwind width class</li>
				<li>Provide header, content, and footer snippets</li>
			</ul>

			<div class="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
				<p class="mb-2 font-semibold text-neutral-900 dark:text-white">Features:</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
					<li>Click outside (backdrop) to close</li>
					<li>Press Escape key to close</li>
					<li>Click the X button to close</li>
					<li>Tab key cycles through focusable elements</li>
					<li>Smooth fade and scale transitions</li>
					<li>Works in light and dark mode</li>
				</ul>
			</div>
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<button class="btn btn-ghost" onclick={onClose}>Cancel</button>
			<button class="btn btn-primary" onclick={onClose}>Confirm</button>
		</div>
	{/snippet}
</Modal>
