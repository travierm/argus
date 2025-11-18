import { getRepoByName } from '$lib/data/repos';
import { getBranchDiff } from '$lib/server/actions/LocalGit';
import { LOCAL_REPOS } from '../../config/repos';
import type { Actions, PageServerLoad } from './diff/$types';

export const load: PageServerLoad = async () => {
	return {
		repos: LOCAL_REPOS
	};
};

export const actions = {
	getDiff: async ({ request }) => {
		const data = await request.formData();

		const repoName = data.get('repo') as string;
		const branchName = data.get('branch') as string;

		const repo = getRepoByName(repoName);
		if (!repo?.path) return { diff: undefined, repo: repoName, branch: branchName };

		return {
			diff: await getBranchDiff(repo?.path, 'main', branchName),
			repo: repoName,
			branch: branchName
		};
	}
} satisfies Actions;
