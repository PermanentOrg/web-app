import { TimezoneVOData } from '@models';
import { PrDatePipe } from './pr-date.pipe';

const cdtTimezone: TimezoneVOData = {
	dstAbbrev: 'CDT',
	dstOffset: '-05:00',
	stdAbbrev: 'CST',
	stdOffset: '-06:00',
};

describe('PrDatePipe', () => {
	it('create an instance', () => {
		const pipe = new PrDatePipe();

		expect(pipe).toBeTruthy();
	});

	it('returns undefined for empty string', () => {
		const pipe = new PrDatePipe();

		expect(pipe.transform('')).toBeUndefined();
	});

	it('returns undefined for null', () => {
		const pipe = new PrDatePipe();

		expect(pipe.transform(null as any)).toBeUndefined();
	});

	describe('date-only strings (no T)', () => {
		it('returns the date formatted from UTC', () => {
			const pipe = new PrDatePipe();

			expect(pipe.transform('2020-06-10')).toBe('2020-06-10');
		});

		it('returns the date when part is date', () => {
			const pipe = new PrDatePipe();

			expect(pipe.transform('2020-06-10', undefined, 'date')).toBe(
				'2020-06-10',
			);
		});

		it('returns undefined when part is time', () => {
			const pipe = new PrDatePipe();

			expect(pipe.transform('2020-06-10', undefined, 'time')).toBeUndefined();
		});

		it('does not shift date by timezone offset', () => {
			const pipe = new PrDatePipe();

			expect(pipe.transform('2020-06-10', cdtTimezone, 'date')).toBe(
				'2020-06-10',
			);
		});

		it('returns undefined for time part even with a timezone', () => {
			const pipe = new PrDatePipe();

			expect(pipe.transform('2020-06-10', cdtTimezone, 'time')).toBeUndefined();
		});
	});

	// it('transforms a DST date in Pacific time', () => {
	//   const pipe = new PrDatePipe();
	//   const displayDT = formatDateISOString('2017-05-13T16:36:29.000000');
	//   const timezoneVO: TimezoneVOData = {
	//     dstAbbrev: 'PDT',
	//     dstOffset: '-07:00',
	//     stdAbbrev: 'PST',
	//     stdOffset: '-08:00',
	//   };
	//   const output = pipe.transform(displayDT, timezoneVO);
	//   expect(output).toContain('PDT');
	//   expect(output).toContain('9:36');
	// });

	// it('transforms a standard date in Pacific time', () => {
	//   const pipe = new PrDatePipe();
	//   const displayDT = formatDateISOString('2017-02-13T16:36:29.000000');
	//   const timezoneVO: TimezoneVOData = {
	//     dstAbbrev: 'PDT',
	//     dstOffset: '-07:00',
	//     stdAbbrev: 'PST',
	//     stdOffset: '-08:00',
	//   };
	//   const output = pipe.transform(displayDT, timezoneVO);
	//   expect(output).toContain('PST');
	//   expect(output).toContain('8:36');
	// });
});
