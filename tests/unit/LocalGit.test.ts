import { expect, test } from 'vitest';
import { LOCAL_REPOS } from '../../src/config/repos';
import { getBranchActivity } from '$lib/server/actions/LocalGit';

test('adds 1 + 2 to equal 3', () => {
	const activity = getBranchActivity(LOCAL_REPOS[0].path);

	console.log(activity);
});
