/* @format */

export function prioritizeIf<T>(list: T[], predicate: (_: T) => boolean): T[] {
	return list.sort((a, b) => Number(predicate(b)) - Number(predicate(a)));
}
