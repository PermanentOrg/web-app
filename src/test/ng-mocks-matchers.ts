/**
 * Custom Jasmine matchers for ng-mocks migration
 * These provide compatibility with shallow-render's toHaveFound/toHaveFoundOne matchers
 */

declare global {
	namespace jasmine {
		interface Matchers<T> {
			toHaveFoundOne(): boolean;
			toHaveFound(expected: number): boolean;
		}
	}
}

export const ngMocksCustomMatchers: jasmine.CustomMatcherFactories = {
	toHaveFoundOne(): jasmine.CustomMatcher {
		return {
			compare(actual: unknown): jasmine.CustomMatcherResult {
				let count: number;
				if (Array.isArray(actual)) {
					count = actual.length;
				} else if (actual && typeof actual === 'object' && 'length' in actual) {
					count = (actual as { length: number }).length;
				} else {
					count = actual ? 1 : 0;
				}
				const pass = count === 1;
				return {
					pass,
					message: pass
						? `Expected not to find exactly one element, but found ${count}`
						: `Expected to find exactly one element, but found ${count}`,
				};
			},
			negativeCompare(actual: unknown): jasmine.CustomMatcherResult {
				let count: number;
				if (Array.isArray(actual)) {
					count = actual.length;
				} else if (actual && typeof actual === 'object' && 'length' in actual) {
					count = (actual as { length: number }).length;
				} else {
					count = actual ? 1 : 0;
				}
				const pass = count !== 1;
				return {
					pass,
					message: pass
						? `Expected to find exactly one element, but found ${count}`
						: `Expected not to find exactly one element`,
				};
			},
		};
	},

	toHaveFound(): jasmine.CustomMatcher {
		return {
			compare(actual: unknown, expected: number): jasmine.CustomMatcherResult {
				let count: number;
				if (Array.isArray(actual)) {
					count = actual.length;
				} else if (actual && typeof actual === 'object' && 'length' in actual) {
					count = (actual as { length: number }).length;
				} else {
					count = actual ? 1 : 0;
				}
				const pass = count === expected;
				return {
					pass,
					message: pass
						? `Expected not to find ${expected} elements, but found ${count}`
						: `Expected to find ${expected} elements, but found ${count}`,
				};
			},
		};
	},
};

export function installNgMocksMatchers(): void {
	beforeEach(() => {
		jasmine.addMatchers(ngMocksCustomMatchers);
	});
}
