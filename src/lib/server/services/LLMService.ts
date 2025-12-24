import { execSync } from 'child_process';

export interface LLMService {
	generateText(prompt: string): string;
}

export function getLLMDriver(): LLMService {
	return new ClaudeCodeService();
}

export class ClaudeCodeService implements LLMService {
	generateText(prompt: string) {
		const args = ['-p', `"${prompt}"`, '--output-format', 'json'];

		// if (options.allowedTools) {
		// 	args.push('--allowedTools', `"${options.allowedTools}"`);
		// }

		const output = execSync(`claude ${args.join(' ')}`, {
			encoding: 'utf-8'
		});

		return JSON.parse(output);
	}
}
