import { container, ContainerBindings } from '$lib/server/container.js';
import { BranchDiffModel } from '$lib/server/models/BranchDiffModel.js';
import { REVIEW_SYSTEM_PROMPT } from '@config/prompts.js';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const diff = BranchDiffModel.findByUuid(data.get('uuid'));

		if (!diff) {
			return;
		}

		const llm = container.resolve(ContainerBindings.LLMService);

		const response = await llm.generateText(`${REVIEW_SYSTEM_PROMPT} diff:`);

		console.log(response);
	}
};
