<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ComponentShowcase from '$lib/components/ComponentShowcase.svelte';
</script>

<div class="mb-8 flex min-h-screen flex-col gap-8">
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
</div>
