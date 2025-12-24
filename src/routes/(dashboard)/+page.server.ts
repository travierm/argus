import { getBranchActivity } from '$lib/server/actions/LocalGit';
import { LOCAL_REPOS } from '../../config/repos';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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
