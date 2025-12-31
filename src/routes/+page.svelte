<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<div class="mx-auto mt-4 max-w-4xl justify-center">
	<div class="grid grid-cols-2 gap-4">
		<!-- Branch Activity -->
		<div class="card">
			<p class="card-title font-bold">Branch Activity</p>
			<div class="card-body p-0">
				<ul class="list-divided text-sm">
					{#each data.activity as activity, index}
						<li class="p-0">
							<form method="POST" action="/review">
								<input type="hidden" name="repo" value={activity.repo_name} />
								<input type="hidden" name="branch" value={activity.branch} />
								<button
									type="submit"
									class="grid w-full cursor-pointer grid-cols-[1fr_auto] gap-4 px-4 py-3 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 {index ===
									0
										? 'rounded-t-lg'
										: ''} {index === data.activity.length - 1 ? 'rounded-b-lg' : ''}"
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
								</button>
							</form>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
