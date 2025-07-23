/* @format */
import { prioritizeIf } from './prioritize-if';

describe('Utils: prioritizeIf', () => {
	const alwaysFalse = (_: any) => false;
	const alwaysTrue = (_: any) => true;
	const isEven = (x: number) => x % 2 === 0;

	it('returns an empty array when passed in an empty array', () => {
		expect(prioritizeIf([], alwaysFalse)).toEqual([]);
	});

	it('keeps the array sorted if no objects pass the predicate', () => {
		expect(prioritizeIf([1, 2, 3, 4, 5], alwaysFalse)).toEqual([1, 2, 3, 4, 5]);
	});

	it('keeps the array sorted if all objects pass the predicate', () => {
		expect(prioritizeIf([1, 2, 3, 4, 5], alwaysTrue)).toEqual([1, 2, 3, 4, 5]);
	});

	it('prioritizes items that pass the predicate over those that do not', () => {
		expect(prioritizeIf([1, 2, 3, 4, 5], isEven)).toEqual([2, 4, 1, 3, 5]);
	});
});
