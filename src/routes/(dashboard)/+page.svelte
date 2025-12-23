<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<div class="grid grid-cols-2 gap-4">
	<!-- Branch Activity -->
	<div class="card">
		<p class="card-title">Branch Activity</p>
		<div class="card-body p-0">
			<ul class="list-divided text-sm">
				{#each data.activity as activity}
					<li
						class="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
					>
						<div class="min-w-0">
							<div class="truncate font-medium text-neutral-900 dark:text-white">
								{activity.branch}
							</div>
							<div class="truncate text-sm text-neutral-500 dark:text-neutral-400">
								{activity.repo_name}
							</div>
						</div>
						<div class="text-right text-sm text-neutral-500 dark:text-neutral-400">
							<div>{activity.date_relative}</div>
							<div class="text-xs">{activity.committer_name}</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
