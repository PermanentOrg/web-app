import { TestBed } from '@angular/core/testing';

import {
	EdtfDisplayService,
	FILE_LIST_DATE_OPTIONS,
} from './edtf-display.service';

describe('EdtfDisplayService', () => {
	let service: EdtfDisplayService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EdtfDisplayService);
	});

	const dateTextOf = (displayTime: string): string =>
		service.formatToPlainText(displayTime);

	const dateEndTextOf = (displayTime: string): string =>
		service
			.formatForDisplay(displayTime)
			.dateEnd.map((segment) => segment.text)
			.join('');

	const timeTextOf = (displayTime: string): string =>
		service
			.formatForDisplay(displayTime)
			.time.map((segment) => segment.text)
			.join('');

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('every value in the supported-values sheet', () => {
		// Ranks are the EDTF_sort_ranking sheet's, so a failure names its row.
		const supportedValues: [
			rank: number,
			storedValue: string,
			expectedDate: string,
			expectedTime: string,
		][] = [
			[1, '../1985-04-12', 'Before Apr. 12, 1985', ''],
			[2, '/1985-04-12', 'Before Apr. 12, 1985', ''],
			[3, '0000', '0000', ''],
			[4, 'XXXX-XX-XX', 'Unknown', ''],
			[5, '1000', '1000', ''],
			[6, '15XX-12-25', 'Dec. 25, 15XX', ''],
			[7, '156X-12-25', 'Dec. 25, 156X', ''],
			[8, '1900-01-01', 'Jan. 1, 1900', ''],
			[9, '1964/2008', '1964 — 2008', ''],
			[11, '1984%', '1984 %', ''],
			[12, '1984?', '1984 ?', ''],
			[13, '1984~', '1984 ~', ''],
			[14, '1985', '1985', ''],
			[15, '1985-XX-03', '1985-XX-03', ''],
			[16, '1985-04', 'April 1985', ''],
			[17, '1985-04-12', 'Apr. 12, 1985', ''],
			[18, '1985-04-12T23:20:30', 'Apr. 12, 1985', '11:20 PM'],
			[19, '1985-04-12T23:20:30-04:00', 'Apr. 12, 1985', '11:20 PM'],
			[20, '1985-04-12/1985-06-10', 'Apr. 12 — Jun. 10, 1985', ''],
			[21, '1985-04-12/', 'After Apr. 12, 1985', ''],
			[22, '1985-04-12/..', 'After Apr. 12, 1985', ''],
		];

		supportedValues.forEach(
			([rank, storedValue, expectedDate, expectedTime]) => {
				it(`should render rank ${rank}, ${storedValue}, as "${expectedDate}"`, () => {
					expect(dateTextOf(storedValue)).toBe(expectedDate);
					expect(timeTextOf(storedValue)).toBe(expectedTime);
				});
			},
		);
	});

	describe('the three shapes the sheet does not list', () => {
		it('should keep both times for a range inside one day', () => {
			const sameDayRange = '2001-09-24T09:45:00Z/2001-09-24T16:00:00Z';

			expect(dateTextOf(sameDayRange)).toBe('Sep. 24, 2001');
			expect(timeTextOf(sameDayRange)).toBe('9:45 AM — 4:00 PM');
		});

		it('should print the month once for a range inside one month', () => {
			expect(dateTextOf('2001-09-24/2001-09-30')).toBe('Sep. 24 — 30, 2001');
		});

		it('should render a range with both sides unknown', () => {
			expect(dateTextOf('/')).toBe('Unknown — Unknown');
		});
	});

	describe('a range splits so its end can wrap', () => {
		it('should keep the dash with the start', () => {
			expect(
				service
					.formatForDisplay('1985-04-12/1985-06-10')
					.date.map((segment) => segment.text)
					.join(''),
			).toBe('Apr. 12 \u2014');

			expect(dateEndTextOf('1985-04-12/1985-06-10')).toBe('Jun. 10, 1985');
		});

		it('should split a same-month range after the dash', () => {
			expect(dateEndTextOf('2001-09-24/2001-09-30')).toBe('30, 2001');
		});

		it('should split a year-only range', () => {
			expect(dateEndTextOf('1964/2008')).toBe('2008');
		});

		it('should split a range with both sides unknown', () => {
			expect(dateEndTextOf('/')).toBe('Unknown');
		});

		it('should not split a value that is not a two-sided range', () => {
			expect(dateEndTextOf('1985-04-12')).toBe('');
			expect(dateEndTextOf('1985-04-12/..')).toBe('');
			expect(dateEndTextOf('../1985-04-12')).toBe('');
			expect(dateEndTextOf('2001-09-24T09:45:00Z/2001-09-24T16:00:00Z')).toBe(
				'',
			);
		});
	});

	describe('qualifiers', () => {
		it('should append the stored symbol rather than an abbreviation', () => {
			expect(dateTextOf('1962-03~')).toBe('March 1962 ~');
			expect(dateTextOf('1962-03~')).not.toContain('c.');
		});

		it('should keep a qualifier on the side that carries it', () => {
			expect(dateTextOf('1984?/1990~')).toBe('1984 ? — 1990 ~');
		});

		it('should not stop a qualified side from merging', () => {
			expect(dateTextOf('2001-09-24?/2001-09-30')).toBe('Sep. 24 ? — 30, 2001');
		});

		it('should mark a qualifier as an annotation so it can be muted', () => {
			const segments = service.formatForDisplay('1984~').date;

			expect(segments).toEqual([
				{ text: '1984', isAnnotation: false },
				{ text: ' ~', isAnnotation: true },
			]);
		});
	});

	describe('annotations', () => {
		it('should mark Unknown as an annotation', () => {
			expect(service.formatForDisplay('XXXX-XX-XX').date).toEqual([
				{ text: 'Unknown', isAnnotation: true },
			]);
		});

		it('should mark the open-interval prefix as an annotation', () => {
			expect(service.formatForDisplay('1985-04-12/..').date).toEqual([
				{ text: 'After ', isAnnotation: true },
				{ text: 'Apr. 12, 1985', isAnnotation: false },
			]);
		});
	});

	describe('values that carry a time', () => {
		it('should drop the seconds', () => {
			expect(timeTextOf('1985-04-12T23:20:59')).toBe('11:20 PM');
		});

		it('should not show a timezone next to the time', () => {
			const rendered = service.formatForDisplay('1985-04-12T23:20:30-04:00');
			const allText = [...rendered.date, ...rendered.time]
				.map((segment) => segment.text)
				.join('');

			expect(allText).not.toMatch(/C[SD]T|UTC|GMT|[+-]\d{2}:\d{2}/);
		});

		it('should drop the time on an interval that is not inside one day', () => {
			expect(timeTextOf('1985-04-12T09:00:00Z/1985-06-10T17:00:00Z')).toBe('');
		});

		it('should drop the time on an open-ended interval', () => {
			expect(timeTextOf('1985-04-12T09:00:00Z/..')).toBe('');
		});
	});

	describe('values it cannot parse', () => {
		it('should show the stored string rather than an error', () => {
			expect(dateTextOf('not-a-date')).toBe('not-a-date');
		});

		it('should show a qualifier on unspecified digits verbatim', () => {
			// Not a supported value: the edtf grammar rejects a qualifier sitting
			// on X digits, so it falls through to the stored string.
			expect(dateTextOf('198X?')).toBe('198X?');
		});

		it('should render nothing for an absent value', () => {
			const nothing = { date: [], dateEnd: [], time: [] };

			expect(service.formatForDisplay('')).toEqual(nothing);
			expect(service.formatForDisplay(null)).toEqual(nothing);
			expect(service.formatForDisplay(undefined)).toEqual(nothing);
		});
	});

	it('should never render the strings the moment pipe produces today', () => {
		const everyStoredValue = [
			'../1985-04-12',
			'/1985-04-12',
			'0000',
			'XXXX-XX-XX',
			'1000',
			'15XX-12-25',
			'156X-12-25',
			'1900-01-01',
			'1964/2008',
			'198X?',
			'1984%',
			'1984?',
			'1984~',
			'1985',
			'1985-XX-03',
			'1985-04',
			'1985-04-12',
			'1985-04-12T23:20:30',
			'1985-04-12T23:20:30-04:00',
			'1985-04-12/1985-06-10',
			'1985-04-12/',
			'1985-04-12/..',
			'/',
			'2001-09-24/2001-09-30',
			'1985-04-XX',
		];

		everyStoredValue.forEach((storedValue) => {
			const rendered = dateTextOf(storedValue);

			expect(rendered).not.toContain('Invalid');
			expect(rendered).not.toContain('NaN');
			expect(rendered).toBeTruthy();
		});
	});

	describe('formatForTooltip', () => {
		it('should carry the times a range drops', () => {
			expect(
				service.formatForTooltip('1985-04-12T09:00:00Z/1985-06-10T17:00:00Z'),
			).toEqual({
				from: 'Apr. 12, 1985 \u2022 9:00:00 AM',
				to: 'Jun. 10, 1985 \u2022 5:00:00 PM',
			});
		});

		it('should say nothing for anything that is not a range hiding a time', () => {
			// a single value always shows its own time, seconds included or not
			expect(service.formatForTooltip('1985-04-12T23:20:30')).toBeNull();
			expect(service.formatForTooltip('1985-04-12T23:20:00')).toBeNull();
			expect(service.formatForTooltip('1985-04-12')).toBeNull();
			// a range carrying no time has nothing to reveal
			expect(service.formatForTooltip('1985-04-12/1985-06-10')).toBeNull();
			expect(service.formatForTooltip('XXXX-XX-XX')).toBeNull();
			expect(service.formatForTooltip('')).toBeNull();
		});

		it('should not claim a same-day range hides its times', () => {
			expect(
				service.formatForTooltip('2001-09-24T09:45:00Z/2001-09-24T16:00:00Z'),
			).toBeNull();
		});

		it('should name an unknown side rather than leaving it blank', () => {
			expect(service.formatForTooltip('1985-04-12T09:00:00Z/')).toEqual({
				from: 'Apr. 12, 1985 \u2022 9:00:00 AM',
				to: 'Unknown',
			});
		});
	});

	describe('formatDateForDisplay', () => {
		it('should read a year as a year without going through a number', () => {
			expect(service.formatDateForDisplay({ year: '0000' })).toBe('0000');
		});

		it('should pad unspecified year digits with X', () => {
			expect(service.formatDateForDisplay({ year: '198' })).toBe('198X');
		});

		it('should abbreviate the month only when a day is present', () => {
			expect(
				service.formatDateForDisplay(
					{ year: '1985', month: '04', day: '12' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('Apr. 12, 1985');

			expect(
				service.formatDateForDisplay(
					{ year: '1985', month: '04' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('April 1985');
		});

		it('should keep the sidebar picker on full month names and padded days', () => {
			expect(
				service.formatDateForDisplay({
					year: '1985',
					month: '05',
					day: '2',
				}),
			).toBe('May 02, 1985');
		});

		it('should drop the leading zero on a day for the file list', () => {
			expect(
				service.formatDateForDisplay(
					{ year: '1900', month: '01', day: '01' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('Jan. 1, 1900');
		});

		it('should keep the numeric form zero-padded when the month is unspecified', () => {
			expect(
				service.formatDateForDisplay(
					{ year: '1985', month: '', day: '03' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('1985-XX-03');
		});

		it('should put a period only on a month that is actually shortened', () => {
			expect(
				service.formatDateForDisplay(
					{ year: '2001', month: '05', day: '24' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('May 24, 2001');

			expect(
				service.formatDateForDisplay(
					{ year: '2001', month: '09', day: '24' },
					FILE_LIST_DATE_OPTIONS,
				),
			).toBe('Sep. 24, 2001');
		});

		it('should render nothing for an empty date', () => {
			expect(
				service.formatDateForDisplay({ year: '', month: '', day: '' }),
			).toBe('');
		});
	});
});
