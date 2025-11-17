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

export function getFileTypeColor(type: string): string {
	const colors = {
		add: '#22c55e',
		delete: '#ef4444',
		modify: '#3b82f6',
		rename: '#f59e0b',
		copy: '#8b5cf6'
	};
	return colors[type as keyof typeof colors] || '#6b7280';
}
