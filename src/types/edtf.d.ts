declare module 'edtf' {
	interface ParseConstraints {
		level?: number;
		types?: string[];
		seasonIntervals?: boolean;
		seasonUncertainty?: boolean;
	}

	interface ParseResult {
		type: string;
		values: number[];
		offset?: number;
		uncertain?: number;
		approximate?: number;
		unspecified?: number;
		level?: number;
	}

	class Bitmask {
		static YMD: number;
		static Y: number;
		static YM: number;

		value: number;
		constructor(value?: number);

		masks(values: string[]): string[];
		marks(values: string[], symbol: string): string[];
		min(values: string[]): number[];
		max(values: string[]): number[];
	}

	class ExtDate extends Date {
		precision: number;
		uncertain: Bitmask;
		approximate: Bitmask;
		unspecified: Bitmask;

		readonly atomic: boolean;
		readonly min: number;
		readonly max: number;
		readonly year: number;
		readonly month: number;
		readonly date: number;
		readonly hours: number;
		readonly minutes: number;
		readonly seconds: number;
		readonly values: number[];

		next(k?: number): ExtDate;
		prev(k?: number): ExtDate;
		toEDTF(): string;
		format(...args: unknown[]): string;

		[Symbol.iterator](): Iterator<ExtDate>;
	}

	class Year extends ExtDate {}
	class Decade extends ExtDate {}
	class Century extends ExtDate {}
	class Season extends ExtDate {}

	class Interval {
		lower: ExtDate | number | null;
		upper: ExtDate | number | null;
		earlier: boolean;
		later: boolean;

		readonly min: number;
		readonly max: number;

		toEDTF(): string;
		format(...args: unknown[]): string;
	}

	class List {
		values: Array<ExtDate | Interval>;
		earlier: boolean;
		later: boolean;

		toEDTF(): string;
	}

	class Set {
		values: Array<ExtDate | Interval>;
		earlier: boolean;
		later: boolean;

		toEDTF(): string;
	}

	const defaults: {
		level: number;
		offset: boolean;
		types: string[];
		seasonIntervals: boolean;
		seasonUncertainty: boolean;
	};

	function parse(input: string, constraints?: ParseConstraints): ParseResult;

	function format(
		date: ExtDate,
		locale?: string,
		options?: Intl.DateTimeFormatOptions,
	): string;

	function edtf(
		input?: string | number | ParseResult,
	): ExtDate | Interval | List | Set;

	// eslint-disable-next-line import/no-default-export
	export default edtf;
	export {
		Bitmask,
		Century,
		Decade,
		ExtDate as Date,
		Interval,
		List,
		Season,
		Set,
		Year,
		defaults,
		format,
		parse,
	};
}
