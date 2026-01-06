<script lang="ts">
	import { REVIEW_SYSTEM_PROMPT } from '@config/prompts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto flex max-w-2xl flex-col p-8">
	<form class="flex flex-col justify-center gap-4" method="POST">
		<div>
			<h1 class="text-2xl font-bold">Generate Code Intelligence</h1>
			<p class=" text-[#8b949e]">Prompt AI for intel on code changes</p>
		</div>
		<input type="hidden" name="uuid" value={data.uuid} />

		<div class="form-group">
			<label>System Prompt</label>
			<textarea disabled class="textarea">{REVIEW_SYSTEM_PROMPT}</textarea>
		</div>

		<textarea class="textarea" placeholder="Extra prompt information..."></textarea>

		<button class="btn btn-primary w-32">Submit</button>
	</form>
</div>
