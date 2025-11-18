import { LOCAL_REPOS } from '../../config/repos';

export function getRepoByName(name: string) {
	return LOCAL_REPOS.find((t) => t.name === name);
}
