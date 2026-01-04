import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LLMService {
	generateText(prompt: string): Promise<string>;
}

export function getLLMDriver(): LLMService {
	return new ClaudeCodeService();
}

export class ClaudeCodeService implements LLMService {
	async generateText(prompt: string): Promise<string> {
		const args = ['-p', `"${prompt}"`, '--output-format', 'json'];

		// if (options.allowedTools) {
		// 	args.push('--allowedTools', `"${options.allowedTools}"`);
		// }

		const { stdout } = await execAsync(`claude ${args.join(' ')}`);

		return JSON.parse(stdout);
	}
}
