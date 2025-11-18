import type { DiffFileType, DiffInfo } from '$lib/diffParser';

export function getFileTypeLabel(type: string): string {
	const labels = {
		add: 'Added',
		delete: 'Deleted',
		modify: 'Modified',
		rename: 'Renamed',
		copy: 'Copied'
	};
	return labels[type as keyof typeof labels] || type;
}

export function getDiffTypeColor(type?: DiffFileType): string {
	if (!type) return '#6b7280'; // gray-500

	const colors: Record<DiffFileType, string> = {
		add: '#22c55e', // green-500
		delete: '#ef4444', // red-500
		modify: '#3b82f6', // blue-500
		rename: '#f59e0b', // amber-500
		copy: '#8b5cf6' // violet-500
	};

	return colors[type] || '#6b7280';
}

export function getFilePath(diff: DiffInfo): string {
	return diff.type === 'delete' ? diff.oldPath || '' : diff.newPath || '';
}
