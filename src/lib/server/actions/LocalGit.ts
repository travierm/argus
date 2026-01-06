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

export async function getBranchActivity(path: string) {
	const fields = ['branch', 'date_iso', 'date_relative', 'committer_name'] as const;
	type BranchActivity = {
		[K in (typeof fields)[number]]: string;
	};

	const output = execSync(
		`git for-each-ref --count=10 --sort=-committerdate refs/ --format='%(refname:short)|%(committerdate:iso)|%(committerdate:relative)|%(committername)'`,
		{
			cwd: path,
			encoding: 'utf-8'
		}
	);

	const branches = output
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => line.split('|'))
		.map((values): BranchActivity => {
			const branchActivity = Object.fromEntries(
				fields.map((key, index) => [key, values[index] || ''])
			) as BranchActivity;

			// Remove 'origin/' prefix from branch name
			branchActivity.branch = branchActivity.branch.replace(/^origin\//, '');

			return branchActivity;
		})
		// Filter out bare 'origin' entries
		.filter((branch) => branch.branch !== 'origin' && branch.branch.length > 0);

	return branches;
}

export async function getBranchDiff(path: string, source: string, target: string) {
	const proc = Bun.spawn(['git', 'diff', source + '...' + target, '--unified=3'], {
		cwd: path
	});
	return (await proc.stdout.text()) as unknown as string;
}
