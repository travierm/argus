import type { DiffInfo } from '$lib/diffParser';
import { getFilePath } from '@routes/(dashboard)/review/diffViewerUtils';

export interface TreeNode {
	name: string;
	path: string;
	type: 'folder' | 'file';
	children?: TreeNode[];
	diff?: DiffInfo;
	index?: number;
	highlight?: string | null;
}

export function buildFileTree(
	files: Array<{ diff: DiffInfo; index: number; highlight: string | null }>
): TreeNode {
	const root: TreeNode = { name: '', path: '', type: 'folder', children: [] };

	for (const { diff, index, highlight } of files) {
		const filePath = getFilePath(diff);
		if (!filePath) continue;

		const parts = filePath.split('/');
		let current = root;

		for (let i = 0; i < parts.length - 1; i++) {
			const folderName = parts[i];
			const folderPath = parts.slice(0, i + 1).join('/');

			let folder = current.children?.find(
				(child) => child.name === folderName && child.type === 'folder'
			);

			if (!folder) {
				folder = {
					name: folderName,
					path: folderPath,
					type: 'folder',
					children: []
				};
				current.children?.push(folder);
			}

			current = folder;
		}

		current.children?.push({
			name: diff.name || '',
			path: filePath,
			type: 'file',
			diff,
			index,
			highlight
		});
	}

	return root;
}
