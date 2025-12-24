import { error } from '@sveltejs/kit';
import { BranchDiffModel } from '$lib/server/models/BranchDiffModel';
import { LOCAL_REPOS } from '../../../../config/repos';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { uuid } = params;

	if (!uuid || uuid.length === 0) {
		throw error(400, 'Invalid UUID format');
	}

	const branchDiff = BranchDiffModel.findByUuid(uuid);

	if (!branchDiff) {
		throw error(404, `Diff not found for UUID: ${uuid}`);
	}

	return {
		repos: LOCAL_REPOS,
		diff: branchDiff.diff,
		repo: branchDiff.repo,
		branch: branchDiff.branch,
		uuid: branchDiff.uuid
	};
};
