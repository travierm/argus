import { getRepoByName } from '$lib/data/repos';
import { getBranchDiff } from '$lib/server/actions/LocalGit';
import { LOCAL_REPOS } from '../../config/repos';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		repos: LOCAL_REPOS
	};
};

export const actions = {
	review: async ({ request }) => {
		const data = await request.formData();

		const repo = getRepoByName(data.get('repo'));

		return {
			diff: await getBranchDiff(repo?.path, 'main', data.get('branch'))
		};
	}
} satisfies Actions;
