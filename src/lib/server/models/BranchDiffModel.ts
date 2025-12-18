import { db } from '../database';
import { randomUUID } from 'crypto';

export type BranchDiff = {
	id: number;
	uuid: string;
	repo: string;
	branch: string;
	diff: string;
};

export class BranchDiffModel {
	static create(data: { repo: string; branch: string; diff: string }): BranchDiff {
		const uuid = randomUUID();

		const result = db.run(
			`INSERT INTO branch_diffs (uuid, repo, branch, diff) VALUES (?, ?, ?, ?)`,
			[uuid, data.repo, data.branch, data.diff]
		);

		return {
			id: Number(result.lastInsertRowid),
			uuid,
			repo: data.repo,
			branch: data.branch,
			diff: data.diff
		};
	}
}
