import { createBinding, TypedContainer } from './framework/TypedContainer';
import { ClaudeCodeService, type LLMService } from './services/LLMService';

export const container = new TypedContainer();

export const ContainerBindings = {
	LLMService: createBinding<LLMService>('LLMService')
};

container.register(
	ContainerBindings.LLMService,
	function () {
		return new ClaudeCodeService();
	},
	{ singleton: true }
);
