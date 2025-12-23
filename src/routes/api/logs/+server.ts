import { json } from '@sveltejs/kit';
import { appendFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { RequestHandler } from './$types';

interface LogEntry {
	type: string;
	timestamp: string;
	data: unknown[];
	url: string;
	userAgent: string;
}

interface LogRequest {
	logs: LogEntry[];
}

export const POST: RequestHandler = async ({ request }) => {
	// Only accept in development
	if (!import.meta.env.DEV) {
		return json({ error: 'Not available in production' }, { status: 404 });
	}

	try {
		const body = (await request.json()) as LogRequest;

		if (!body.logs || !Array.isArray(body.logs)) {
			return json({ error: 'Invalid request body' }, { status: 400 });
		}

		// Ensure logs directory exists
		const logsDir = resolve(process.cwd(), 'storage/logs');
		mkdirSync(logsDir, { recursive: true });

		// Format and append logs
		const logPath = resolve(logsDir, 'browser.log');
		const formatted = body.logs
			.map((log) => {
				const dataStr = JSON.stringify(log.data);
				return `[${log.timestamp}] [${log.type}] ${log.url} - ${dataStr}\n`;
			})
			.join('');

		appendFileSync(logPath, formatted, 'utf-8');

		return json({ success: true });
	} catch (error) {
		console.error('Failed to write browser logs:', error);
		// Return success anyway to avoid client-side errors
		return json({ success: true });
	}
};
