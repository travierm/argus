/**
 * Modern theme management using Svelte 5 runes
 * Supports both localStorage persistence and prefers-color-scheme
 */

import { browser } from '$app/environment';

function createTheme() {
	// Initialize from DOM to prevent flash - the blocking script in app.html already set the class
	let isDark = $state(browser ? document.documentElement.classList.contains('dark') : false);

	// Initialize theme on client-side
	if (browser) {
		// Listen for system preference changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			// Only auto-switch if user hasn't set a preference
			if (localStorage.getItem('theme') === null) {
				isDark = e.matches;
				applyTheme(e.matches);
			}
		});
	}

	function applyTheme(dark: boolean) {
		if (dark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function toggle() {
		isDark = !isDark;
		applyTheme(isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	function setTheme(dark: boolean) {
		isDark = dark;
		applyTheme(dark);
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}

	function clearPreference() {
		localStorage.removeItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDark = prefersDark;
		applyTheme(prefersDark);
	}

	return {
		get isDark() {
			return isDark;
		},
		toggle,
		setTheme,
		clearPreference
	};
}

export const theme = createTheme();
