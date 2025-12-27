<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		maxWidth?: string;
		header?: Snippet;
		content: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(),
		onClose,
		maxWidth = 'max-w-2xl',
		header,
		content,
		footer
	}: Props = $props();

	let modalElement: HTMLDivElement | undefined = $state();
	let previousActiveElement: HTMLElement | null = null;

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			onClose();
		}
	}

	// Focus trap
	function handleTabKey(event: KeyboardEvent) {
		if (!open || !modalElement) return;

		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (event.key === 'Tab') {
			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement?.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement?.focus();
				}
			}
		}
	}

	// Manage focus and body scroll
	$effect(() => {
		if (open) {
			// Save previously focused element
			previousActiveElement = document.activeElement as HTMLElement;

			// Lock body scroll
			document.body.style.overflow = 'hidden';

			// Focus first focusable element in modal
			setTimeout(() => {
				const focusableElements = modalElement?.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				const firstElement = focusableElements?.[0] as HTMLElement;
				firstElement?.focus();
			}, 100);
		} else {
			// Restore body scroll
			document.body.style.overflow = '';

			// Return focus to previous element
			if (previousActiveElement) {
				previousActiveElement.focus();
			}
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Modal Container -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/70" onclick={onClose}></div>

		<!-- Modal Content -->
		<div
			bind:this={modalElement}
			class="card relative z-10 w-full {maxWidth} max-h-[90vh] overflow-hidden !bg-white !p-0 dark:!bg-neutral-900"
			role="dialog"
			aria-modal="true"
			aria-labelledby={header ? 'modal-title' : undefined}
			aria-label={header ? undefined : 'Dialog'}
			tabindex="-1"
			transition:scale={{ duration: 200, start: 0.95 }}
			onkeydown={handleTabKey}
		>
			<!-- Header -->
			{#if header}
				<div
					class="card-title relative flex items-center justify-between border-b border-neutral-200 p-4 dark:border-white/8"
				>
					<div id="modal-title">
						{@render header()}
					</div>
					<button
						type="button"
						onclick={onClose}
						class="btn-ghost flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
						aria-label="Close modal"
					>
						<X size={20} />
					</button>
				</div>
			{:else}
				<!-- Close button when no header -->
				<button
					type="button"
					onclick={onClose}
					class="btn-ghost absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
					aria-label="Close modal"
				>
					<X size={20} />
				</button>
			{/if}

			<!-- Content -->
			<div class="overflow-y-auto p-4">
				{@render content()}
			</div>

			<!-- Footer -->
			{#if footer}
				<div class="border-t border-neutral-200 p-6 dark:border-white/8">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
