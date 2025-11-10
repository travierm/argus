import { json } from '@sveltejs/kit';
import { execSync } from 'child_process';

export async function GET({ url }) {
	const repoPath = url.searchParams.get('path');

	if (!repoPath) {
		return json({ error: 'Missing repo path' }, { status: 400 });
	}

	try {
		const output = execSync(`git branch -a`, {
			cwd: repoPath,
			encoding: 'utf-8'
		});

		const branches = output
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((line) => ({
				name: line.replace(/^\*\s+/, '').replace(/^remotes\//, ''),
				isRemote: line.includes('remotes/'),
				isCurrent: line.startsWith('*')
			}));

		return json({ branches });
	} catch (error) {
		return json({ error: 'Failed to fetch branches' }, { status: 500 });
	}
}
