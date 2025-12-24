import { getBranches } from '$lib/server/actions/LocalGit.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const repoPath = url.searchParams.get('path');

	if (!repoPath) {
		return json({ error: 'Missing repo path' }, { status: 400 });
	}

	try {
		return json({
			branches: await getBranches(repoPath)
		});
	} catch (error) {
		console.error(error);

		return json({ error: 'Failed to fetch branches' }, { status: 500 });
	}
}
