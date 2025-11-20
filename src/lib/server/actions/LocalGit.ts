import { execSync } from 'child_process';

export async function getBranches(path: string) {
	const output = execSync(`git branch -l`, {
		cwd: path,
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

	return branches;
}

export async function getBranchDiff(path: string, source: string, target: string) {
	const proc = Bun.spawn(['git', 'diff', source + '...' + target, '--unified=3'], {
		cwd: path
	});
	return (await proc.stdout.text()) as unknown as string;
}
