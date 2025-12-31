import { getRepoByName } from '$lib/data/repos';
import { getBranchActivity, getBranchDiff } from '$lib/server/actions/LocalGit';
import { BranchDiffModel } from '$lib/server/models/BranchDiffModel';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { LOCAL_REPOS } from '@config/repos';

export const load: PageServerLoad = async () => {
	// Run getBranchActivity in parallel for all repos
	const activityByRepo = await Promise.all(
		LOCAL_REPOS.map(async (r) => {
			const branches = await getBranchActivity(r.path);
			// Add repo_name to each branch activity
			return branches.map((branch) => ({
				...branch,
				repo_name: r.name
			}));
		})
	);

	// Flatten and sort by date_iso (newest first)
	const activity = activityByRepo.flat().sort((a, b) => {
		return new Date(b.date_iso).getTime() - new Date(a.date_iso).getTime();
	});

	return {
		activity
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

		// Redirect to changes tab by default
		redirect(303, `/review/${diff.uuid}/changes`);
	}
} satisfies Actions;
