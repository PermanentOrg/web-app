import 'vitest';

declare module 'vitest' {
	interface Assertion<T = any> {
		toHaveFoundOne(): T;
		toHaveFound(expected: number): T;
	}
	interface AsymmetricMatchersContaining {
		toHaveFoundOne(): void;
		toHaveFound(expected: number): void;
	}
}
