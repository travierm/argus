import { LOCAL_REPOS, type LocalRepo } from '../../config/repos';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		repos: LOCAL_REPOS
	};
};
