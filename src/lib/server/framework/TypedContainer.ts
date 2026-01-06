type Factory<T> = () => T;

interface Registration<T> {
	factory: Factory<T>;
	singleton: boolean;
	instance?: T;
}

export function createBinding<T>(description: string): symbol & { __type?: T } {
	return Symbol(description) as symbol & { __type?: T };
}

export class TypedContainer {
	private registrations = new Map<symbol, Registration<any>>();

	register<T>(
		token: symbol & { __type?: T },
		factory: Factory<T>,
		options: { singleton?: boolean } = {}
	): this {
		this.registrations.set(token, {
			factory,
			singleton: options.singleton ?? false
		});
		return this;
	}

	resolve<T>(token: symbol & { __type?: T }): T {
		const registration = this.registrations.get(token);
		if (!registration) {
			throw new Error(`No registration found for token: ${token.toString()}`);
		}

		if (registration.singleton && registration.instance !== undefined) {
			return registration.instance;
		}

		const instance = registration.factory();
		if (registration.singleton) {
			registration.instance = instance;
		}
		return instance;
	}
}
