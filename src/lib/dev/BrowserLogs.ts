// CREDIT: https://github.com/laravel/boost/blob/main/src/Services/BrowserLogger.php

export function initBrowserLogger(endpoint: string): void {
	const logQueue: unknown[] = [];
	let flushTimeout: ReturnType<typeof setTimeout> | null = null;

	console.log('🔍 Browser logger active (dev mode). Posting to: ' + endpoint);

	// Store original console methods
	const originalConsole = {
		log: console.log,
		info: console.info,
		error: console.error,
		warn: console.warn,
		table: console.table
	};

	// Helper to safely stringify values
	function safeStringify(obj: unknown): string {
		const seen = new WeakSet();
		return JSON.stringify(obj, (key, value) => {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) return '[Circular]';
				seen.add(value);
			}
			if (value instanceof Error) {
				return {
					name: value.name,
					message: value.message,
					stack: value.stack
				};
			}
			return value;
		});
	}

	// Batch and send logs
	function flushLogs(): void {
		if (logQueue.length === 0) return;

		const batch = logQueue.splice(0, logQueue.length);

		fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest'
			},
			body: JSON.stringify({ logs: batch })
		}).catch((err) => {
			// Silently fail to avoid infinite loops
			originalConsole.error('Failed to send logs:', err);
		});
	}

	// Debounced flush (100ms)
	function scheduleFlush(): void {
		if (flushTimeout) clearTimeout(flushTimeout);
		flushTimeout = setTimeout(flushLogs, 100);
	}

	// Intercept console methods
	(['log', 'info', 'error', 'warn', 'table'] as const).forEach((method) => {
		console[method] = function (...args: unknown[]) {
			// Call original method
			originalConsole[method].apply(console, args);

			// Capture log data
			try {
				logQueue.push({
					type: method,
					timestamp: new Date().toISOString(),
					data: args.map((arg) => {
						try {
							return typeof arg === 'object' ? JSON.parse(safeStringify(arg)) : arg;
						} catch (e) {
							return String(arg);
						}
					}),
					url: window.location.href,
					userAgent: navigator.userAgent
				});

				scheduleFlush();
			} catch (e) {
				// Fail silently
			}
		} as typeof console[typeof method];
	});

	// Global error handlers for uncaught errors
	const originalOnError = window.onerror;
	window.onerror = function boostErrorHandler(
		errorMsg,
		url,
		lineNumber,
		colNumber,
		error
	): boolean {
		try {
			logQueue.push({
				type: 'uncaught_error',
				timestamp: new Date().toISOString(),
				data: [
					{
						message: errorMsg,
						filename: url,
						lineno: lineNumber,
						colno: colNumber,
						error: error
							? {
									name: error.name,
									message: error.message,
									stack: error.stack
								}
							: null
					}
				],
				url: window.location.href,
				userAgent: navigator.userAgent
			});

			scheduleFlush();
		} catch (e) {
			// Fail silently
		}

		// Call original handler if it exists
		if (originalOnError && typeof originalOnError === 'function') {
			return originalOnError(errorMsg, url, lineNumber, colNumber, error);
		}

		// Let the error continue to propagate
		return false;
	};

	window.addEventListener('error', (event) => {
		try {
			logQueue.push({
				type: 'window_error',
				timestamp: new Date().toISOString(),
				data: [
					{
						message: event.message,
						filename: event.filename,
						lineno: event.lineno,
						colno: event.colno,
						error: event.error
							? {
									name: event.error.name,
									message: event.error.message,
									stack: event.error.stack
								}
							: null
					}
				],
				url: window.location.href,
				userAgent: navigator.userAgent
			});

			scheduleFlush();
		} catch (e) {
			// Fail silently
		}
	});

	window.addEventListener('unhandledrejection', (event) => {
		try {
			logQueue.push({
				type: 'error',
				timestamp: new Date().toISOString(),
				data: [
					{
						message: 'Unhandled Promise Rejection',
						reason:
							event.reason instanceof Error
								? {
										name: event.reason.name,
										message: event.reason.message,
										stack: event.reason.stack
									}
								: event.reason
					}
				],
				url: window.location.href,
				userAgent: navigator.userAgent
			});

			scheduleFlush();
		} catch (e) {
			// Fail silently
		}
	});

	// Flush on page unload
	window.addEventListener('beforeunload', () => {
		if (logQueue.length > 0) {
			navigator.sendBeacon(endpoint, JSON.stringify({ logs: logQueue }));
		}
	});
}
