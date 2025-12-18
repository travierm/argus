import { getRepoByName } from '$lib/data/repos';
import { getBranchDiff } from '$lib/server/actions/LocalGit';
import { BranchDiffModel } from '$lib/server/models/BranchDiffModel';
import { redirect } from '@sveltejs/kit';
import { LOCAL_REPOS } from '../../config/repos';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		repos: LOCAL_REPOS
	};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const repoName = data.get('repo') as string;
		const branchName = data.get('branch') as string;

		const repo = getRepoByName(repoName);
		if (!repo?.path) return { diff: undefined, repo: repoName, branch: branchName };

		const diff = BranchDiffModel.create({
			repo: repoName,
			branch: branchName,
			diff: await getBranchDiff(repo?.path, 'main', branchName)
		});

		redirect(303, '/review/' + diff.uuid);
	}
} satisfies Actions;
