<script lang="ts">
	import ComponentShowcase from '$lib/components/ComponentShowcase.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let isBasicModalOpen = $state(false);
	let isCustomModalOpen = $state(false);
	let isNoHeaderModalOpen = $state(false);
</script>

<svelte:head>
	<title>Components</title>
</svelte:head>

<div class="mx-auto mt-4 mb-8 flex max-w-4xl flex-col gap-8">
	<!-- Buttons -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Buttons</h1>

		<ComponentShowcase
			title="Button Variants"
			code={`<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-dark">Dark</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>`}
		>
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
		</ComponentShowcase>
	</div>

	<!-- Cards -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cards</h1>

		<ComponentShowcase
			title="Card Structure"
			code={`<div class="card">
  <h1 class="card-title">Title</h1>
  <div class="card-body">
    <p>Body content</p>
  </div>
</div>`}
		>
			<div class="card">
				<h1 class="card-title">Title</h1>
				<div class="card-body min-h-[200px] min-w-[200px]">
					<p>Body</p>
				</div>
			</div>
		</ComponentShowcase>
	</div>

	<!-- Lists -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Lists</h1>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<ComponentShowcase
				title="Unordered List"
				code={`<ul class="list-disc">
  <li>First item</li>
  <li>Second item</li>
  <li>Third item with nested list
    <ul class="list-disc">
      <li>Nested item 1</li>
      <li>Nested item 2</li>
    </ul>
  </li>
</ul>`}
			>
				<ul class="list-disc">
					<li>First item</li>
					<li>Second item</li>
					<li>
						Third item with nested list
						<ul class="list-disc">
							<li>Nested item 1</li>
							<li>Nested item 2</li>
						</ul>
					</li>
				</ul>
			</ComponentShowcase>

			<ComponentShowcase
				title="Ordered List"
				code={`<ol class="list-decimal">
  <li>First step</li>
  <li>Second step</li>
  <li>Third step with nested
    <ol class="list-decimal">
      <li>Sub-step A</li>
      <li>Sub-step B</li>
    </ol>
  </li>
</ol>`}
			>
				<ol class="list-decimal">
					<li>First step</li>
					<li>Second step</li>
					<li>
						Third step with nested
						<ol class="list-decimal">
							<li>Sub-step A</li>
							<li>Sub-step B</li>
						</ol>
					</li>
				</ol>
			</ComponentShowcase>

			<ComponentShowcase
				title="Compact List"
				code={`<ul class="list-disc list-compact">
  <li>Compact item 1</li>
  <li>Compact item 2</li>
  <li>Compact item 3</li>
  <li>Compact item 4</li>
</ul>`}
			>
				<ul class="list-compact list-disc">
					<li>Compact item 1</li>
					<li>Compact item 2</li>
					<li>Compact item 3</li>
					<li>Compact item 4</li>
				</ul>
			</ComponentShowcase>

			<ComponentShowcase
				title="Divided List"
				code={`<ul class="list-divided">
  <li>Item with divider</li>
  <li>Another item</li>
  <li>Final item</li>
</ul>`}
			>
				<ul class="list-divided max-w-xs">
					<li>Item with divider</li>
					<li>Another item</li>
					<li>Final item</li>
				</ul>
			</ComponentShowcase>

			<ComponentShowcase
				title="List Inside Container"
				code={`<ul class="list-inside list-disc">
  <li>Contained item 1</li>
  <li>Contained item 2</li>
  <li>Contained item 3</li>
</ul>`}
			>
				<ul class="list-inside list-disc">
					<li>Contained item 1</li>
					<li>Contained item 2</li>
					<li>Contained item 3</li>
				</ul>
			</ComponentShowcase>
		</div>
	</div>

	<!-- Modals -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Modals</h1>

		<ComponentShowcase
			title="Basic Modal"
			code={`<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  let isOpen = $state(false);
</script>

<button class="btn btn-primary" onclick={() => isOpen = true}>
  Open Modal
</button>

<Modal open={isOpen} onClose={() => isOpen = false}>
  {#snippet header()}
    <h2 class="text-xl font-bold">Modal Title</h2>
  {/snippet}

  {#snippet content()}
    <p>Your content here...</p>
  {/snippet}

  {#snippet footer()}
    <div class="flex justify-end gap-2">
      <button class="btn btn-ghost" onclick={() => isOpen = false}>
        Cancel
      </button>
      <button class="btn btn-primary" onclick={() => isOpen = false}>
        Confirm
      </button>
    </div>
  {/snippet}
</Modal>`}
		>
			<button class="btn btn-primary max-w-40" onclick={() => (isBasicModalOpen = true)}>
				Open Basic Modal
			</button>

			<Modal open={isBasicModalOpen} onClose={() => (isBasicModalOpen = false)}>
				{#snippet header()}
					<h2 class="text-xl font-bold text-neutral-900 dark:text-white">Modal Title</h2>
				{/snippet}

				{#snippet content()}
					<div class="space-y-4">
						<p class="text-neutral-700 dark:text-neutral-300">
							This is a basic modal with header, content, and footer sections.
						</p>
						<p class="text-neutral-700 dark:text-neutral-300">
							You can close it by clicking the backdrop, pressing Escape, or clicking the X button.
						</p>
					</div>
				{/snippet}

				{#snippet footer()}
					<div class="flex justify-end gap-2">
						<button class="btn btn-ghost" onclick={() => (isBasicModalOpen = false)}>
							Cancel
						</button>
						<button class="btn btn-primary" onclick={() => (isBasicModalOpen = false)}>
							Confirm
						</button>
					</div>
				{/snippet}
			</Modal>
		</ComponentShowcase>

		<ComponentShowcase
			title="Custom Width Modal"
			code={`<Modal open={isOpen} onClose={onClose} maxWidth="max-w-4xl">
  {#snippet content()}
    <p>This modal is wider with max-w-4xl</p>
  {/snippet}
</Modal>`}
		>
			<button class="btn btn-secondary max-w-40" onclick={() => (isCustomModalOpen = true)}>
				Open Wide Modal
			</button>

			<Modal
				open={isCustomModalOpen}
				onClose={() => (isCustomModalOpen = false)}
				maxWidth="max-w-4xl"
			>
				{#snippet header()}
					<h2 class="text-xl font-bold text-neutral-900 dark:text-white">Wide Modal</h2>
				{/snippet}

				{#snippet content()}
					<div class="space-y-4">
						<p class="text-neutral-700 dark:text-neutral-300">
							This modal uses <code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800"
								>max-w-4xl</code
							> for a wider layout.
						</p>
						<p class="text-neutral-700 dark:text-neutral-300">
							You can customize the width by passing any Tailwind max-width class like <code
								class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-sm</code
							>,
							<code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-md</code>,
							<code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-lg</code>,
							<code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-xl</code>,
							<code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-2xl</code>,
							<code class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">max-w-4xl</code>,
							etc.
						</p>
					</div>
				{/snippet}

				{#snippet footer()}
					<div class="flex justify-end gap-2">
						<button class="btn btn-primary" onclick={() => (isCustomModalOpen = false)}>
							Close
						</button>
					</div>
				{/snippet}
			</Modal>
		</ComponentShowcase>

		<ComponentShowcase
			title="Modal Without Header"
			code={`<Modal open={isOpen} onClose={onClose}>
  {#snippet content()}
    <p>This modal has no header, only content and close button.</p>
  {/snippet}
</Modal>`}
		>
			<button class="btn btn-outline max-w-40" onclick={() => (isNoHeaderModalOpen = true)}>
				No Header Modal
			</button>

			<Modal open={isNoHeaderModalOpen} onClose={() => (isNoHeaderModalOpen = false)}>
				{#snippet content()}
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-neutral-900 dark:text-white">Content Only</h3>
						<p class="text-neutral-700 dark:text-neutral-300">
							This modal doesn't use the header snippet, so only the X button appears in the top
							right corner.
						</p>
						<p class="text-neutral-700 dark:text-neutral-300">
							This is useful for simpler dialogs or confirmation prompts.
						</p>
					</div>
				{/snippet}
			</Modal>
		</ComponentShowcase>

		<div
			class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
		>
			<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Modal Features</h3>
			<ul class="list-inside list-disc space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
				<li>Click outside (backdrop) to close</li>
				<li>Press Escape key to close</li>
				<li>Click the X button to close</li>
				<li>Tab key cycles through focusable elements (focus trap)</li>
				<li>Smooth fade and scale transitions</li>
				<li>Body scroll lock when modal is open</li>
				<li>ARIA attributes for accessibility</li>
				<li>Works in light and dark mode</li>
				<li>
					Customizable width via <code
						class="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">maxWidth</code
					> prop
				</li>
			</ul>
		</div>
	</div>

	<!-- Form Inputs -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Form Inputs</h1>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<ComponentShowcase
				title="Basic Input"
				code={`<div class="form-group">
  <label class="form-label" for="email">
    Email
  </label>
  <input
    id="email"
    type="email"
    class="input"
    placeholder="you@example.com"
  />
</div>`}
			>
				<div class="form-group w-full max-w-xs">
					<label class="form-label" for="email">Email</label>
					<input
						id="email"
						type="email"
						class="input"
						placeholder="you@example.com"
						autocomplete="off"
					/>
				</div>
			</ComponentShowcase>

			<ComponentShowcase
				title="Input with Error"
				code={`<div class="form-group">
  <label class="form-label-error" for="username">
    Username
  </label>
  <input
    id="username"
    type="text"
    class="input input-error"
    value="user@"
  />
  <span class="form-error-message">
    Username cannot contain @ symbol
  </span>
</div>`}
			>
				<div class="form-group w-full max-w-xs">
					<label class="form-label-error" for="username">Username</label>
					<input
						id="username"
						type="text"
						class="input input-error"
						value="user@"
						autocomplete="off"
					/>
					<span class="form-error-message">Username cannot contain @ symbol</span>
				</div>
			</ComponentShowcase>
		</div>
	</div>

	<!-- Textareas -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Textareas</h1>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<ComponentShowcase
				title="Basic Textarea"
				code={`<div class="form-group">
  <label class="form-label" for="description">
    Description
  </label>
  <textarea
    id="description"
    class="textarea"
    placeholder="Enter description..."
  ></textarea>
</div>`}
			>
				<div class="form-group w-full max-w-xs">
					<label class="form-label" for="description">Description</label>
					<textarea id="description" class="textarea" placeholder="Enter description..."></textarea>
				</div>
			</ComponentShowcase>

			<ComponentShowcase
				title="Textarea with Error"
				code={`<div class="form-group">
  <label class="form-label-error" for="comment">
    Comment
  </label>
  <textarea
    id="comment"
    class="textarea textarea-error"
  >Too short</textarea>
  <span class="form-error-message">
    Must be at least 20 characters
  </span>
</div>`}
			>
				<div class="form-group w-full max-w-xs">
					<label class="form-label-error" for="comment">Comment</label>
					<textarea id="comment" class="textarea textarea-error">Too short</textarea>
					<span class="form-error-message">Must be at least 20 characters</span>
				</div>
			</ComponentShowcase>
		</div>
	</div>

	<!-- Checkboxes -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Checkboxes</h1>

		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<ComponentShowcase
				title="Basic Checkbox"
				code={`<div class="checkbox-group">
  <input
    id="terms"
    type="checkbox"
    class="checkbox"
  />
  <label class="checkbox-label" for="terms">
    I agree to the terms and conditions
  </label>
</div>`}
			>
				<div class="checkbox-group">
					<input id="terms" type="checkbox" class="checkbox" />
					<label class="checkbox-label" for="terms"> I agree to the terms and conditions </label>
				</div>
			</ComponentShowcase>

			<ComponentShowcase
				title="Multiple Checkboxes"
				code={`<div class="form-group">
  <label class="form-label">
    Select your interests
  </label>
  <div class="space-y-2">
    <div class="checkbox-group">
      <input id="sports" type="checkbox" class="checkbox" checked />
      <label class="checkbox-label" for="sports">Sports</label>
    </div>
    <div class="checkbox-group">
      <input id="music" type="checkbox" class="checkbox" />
      <label class="checkbox-label" for="music">Music</label>
    </div>
    <div class="checkbox-group">
      <input id="travel" type="checkbox" class="checkbox" checked />
      <label class="checkbox-label" for="travel">Travel</label>
    </div>
  </div>
</div>`}
			>
				<div class="form-group">
					<label class="form-label">Select your interests</label>
					<div class="space-y-2">
						<div class="checkbox-group">
							<input id="sports" type="checkbox" class="checkbox" checked />
							<label class="checkbox-label" for="sports">Sports</label>
						</div>
						<div class="checkbox-group">
							<input id="music" type="checkbox" class="checkbox" />
							<label class="checkbox-label" for="music">Music</label>
						</div>
						<div class="checkbox-group">
							<input id="travel" type="checkbox" class="checkbox" checked />
							<label class="checkbox-label" for="travel">Travel</label>
						</div>
					</div>
				</div>
			</ComponentShowcase>
		</div>
	</div>
</div>
