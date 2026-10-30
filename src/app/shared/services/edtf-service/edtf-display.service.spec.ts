import { TestBed } from '@angular/core/testing';

import {
	EdtfDisplayService,
	FILE_LIST_DATE_OPTIONS,
} from './edtf-display.service';
import { DateTimeModel, EdtfService } from './edtf.service';

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

	const timeTextOf = (displayTime: string, timezone?: string | null): string =>
		service
			.formatForDisplay(displayTime, timezone)
			.time.map((segment) => segment.text)
			.join('');

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('every value in the supported-values sheet', () => {
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
			[10, '198X?', '198X ?', ''],
			[11, '1984%', '1984 %', ''],
			[12, '1984?', '1984 ?', ''],
			[13, '1984~', '1984 ~', ''],
			[14, '1985', '1985', ''],
			[15, '1985-XX-03', '1985-XX-03', ''],
			[16, '1985-04', 'April 1985', ''],
			[17, '1985-04-12', 'Apr. 12, 1985', ''],
			[18, '1985-04-12T23:20:30', 'Apr. 12, 1985', '11:20 PM'],
			[19, '1985-04-12T23:20:30-04:00', 'Apr. 12, 1985', '11:20 PM -04'],
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

		it('should print both years for a range across years', () => {
			expect(dateTextOf('1985-04-12/1986-06-10')).toBe(
				'Apr. 12, 1985 — Jun. 10, 1986',
			);
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

		it('should mute the meridiem', () => {
			expect(service.formatForDisplay('1985-04-12T23:20:30').time).toEqual([
				{ text: '11:20', isAnnotation: false },
				{ text: ' PM', isAnnotation: true },
			]);
		});

		it('should drop the time on an interval that is not inside one day', () => {
			expect(timeTextOf('1985-04-12T09:00:00Z/1985-06-10T17:00:00Z')).toBe('');
		});

		it('should drop the time on an open-ended interval', () => {
			expect(timeTextOf('1985-04-12T09:00:00Z/..')).toBe('');
		});

		it('should keep the one time a same-day range carries', () => {
			expect(timeTextOf('2001-09-24/2001-09-24T16:00:00Z')).toBe('4:00 PM');
		});

		it('should show no time for a same-day range carrying none', () => {
			expect(timeTextOf('2001-09-24/2001-09-24')).toBe('');
		});
	});

	describe('the timezone next to the time', () => {
		it('should show the tzdata abbreviation of the stored zone at that date', () => {
			expect(timeTextOf('1985-04-12T23:20:30', 'America/Chicago')).toBe(
				'11:20 PM CST',
			);

			expect(timeTextOf('1985-07-12T23:20:30', 'America/Chicago')).toBe(
				'11:20 PM CDT',
			);

			expect(timeTextOf('2026-06-24T15:00:00', 'Asia/Jerusalem')).toBe(
				'3:00 PM IDT',
			);

			expect(timeTextOf('2026-01-24T15:00:00', 'Asia/Jerusalem')).toBe(
				'3:00 PM IST',
			);
		});

		it('should mute the timezone together with the meridiem', () => {
			expect(
				service.formatForDisplay('1985-04-12T23:20:30', 'America/Chicago').time,
			).toEqual([
				{ text: '11:20', isAnnotation: false },
				{ text: ' PM CST', isAnnotation: true },
			]);
		});

		it('should show what tzdata shows for a zone without letters', () => {
			expect(timeTextOf('1985-07-12T23:20:30', 'Asia/Dubai')).toBe(
				'11:20 PM +04',
			);
		});

		it('should show local mean time before the zone adopted standard time', () => {
			expect(timeTextOf('1850-04-12T23:20:30', 'America/Chicago')).toBe(
				'11:20 PM LMT',
			);
		});

		it('should prefer the stored zone over the offset in the string', () => {
			expect(timeTextOf('1985-04-12T23:20:30-04:00', 'America/Chicago')).toBe(
				'11:20 PM CST',
			);
		});

		it('should write the offset in the string as tzdata would when no zone is stored', () => {
			expect(timeTextOf('1985-04-12T23:20:30+03:00')).toBe('11:20 PM +03');
			expect(timeTextOf('1985-04-12T23:20:30+05:30')).toBe('11:20 PM +0530');
		});

		it('should treat an unusable stored zone as absent', () => {
			expect(timeTextOf('1985-04-12T23:20:30-04:00', 'Not/AZone')).toBe(
				'11:20 PM -04',
			);

			expect(timeTextOf('1985-04-12T23:20:30', '')).toBe('11:20 PM');
		});

		it('should show nothing when neither a zone nor an offset is known', () => {
			expect(timeTextOf('1985-04-12T23:20:30')).toBe('11:20 PM');
			expect(timeTextOf('1985-04-12T23:20:30Z')).toBe('11:20 PM');
		});

		it('should not add a zone to a value without a time', () => {
			const rendered = service.formatForDisplay(
				'1985-04-12',
				'America/Chicago',
			);

			expect(rendered.time).toEqual([]);
			expect(service.formatToPlainText('1985-04-12')).toBe('Apr. 12, 1985');
		});

		it('should show the zone once at the end of a same-day range', () => {
			expect(
				timeTextOf(
					'2001-09-24T09:45:00Z/2001-09-24T16:00:00Z',
					'America/Chicago',
				),
			).toBe('9:45 AM — 4:00 PM CDT');
		});

		it('should show each zone of a same-day range whose sides differ', () => {
			const acrossSpringForward =
				'2026-03-29T01:30:00+01:00/2026-03-29T03:30:00+02:00';

			expect(timeTextOf(acrossSpringForward, 'Europe/Berlin')).toBe(
				'1:30 AM CET — 3:30 AM CEST',
			);

			expect(timeTextOf(acrossSpringForward)).toBe('1:30 AM +01 — 3:30 AM +02');
		});

		it('should label the later occurrence of a repeated hour by its stored offset', () => {
			expect(timeTextOf('2026-10-25T01:30:00+02:00', 'Asia/Jerusalem')).toBe(
				'1:30 AM IST',
			);
		});

		it('should show the zone after the one time a same-day range carries', () => {
			expect(
				timeTextOf('2001-09-24/2001-09-24T16:00:00Z', 'America/Chicago'),
			).toBe('4:00 PM CDT');
		});

		it('should give each side of a range hiding its times its own zone in the tooltip', () => {
			expect(
				service.formatForTooltip(
					'1985-04-12T09:00:00/1985-06-10T17:00:00',
					'America/Chicago',
				),
			).toEqual({
				from: 'Apr. 12, 1985 \u2022 9:00:00 AM CST',
				to: 'Jun. 10, 1985 \u2022 5:00:00 PM CDT',
			});
		});
	});

	describe('models the parser does not produce today', () => {
		const stubParsedModel = (model: DateTimeModel): void => {
			spyOn(TestBed.inject(EdtfService), 'toDateTimeModel').and.returnValue(
				model,
			);
		};

		const renderModel = (model: DateTimeModel): string => {
			stubParsedModel(model);
			const rendered = service.formatForDisplay('stubbed');
			return [rendered.date, rendered.time]
				.map((segments) => segments.map((segment) => segment.text).join(''))
				.filter(Boolean)
				.join(' ');
		};

		it('should render a 24-hour time zero-padded and without a meridian', () => {
			expect(
				renderModel({
					date: { year: '1985', month: '04', day: '12' },
					time: { hours: '7', minutes: '5', format: 'h24' },
				}),
			).toBe('Apr. 12, 1985 07:05');
		});

		it('should fill in missing minutes', () => {
			expect(
				renderModel({
					date: { year: '1985', month: '04', day: '12' },
					time: { hours: '07', format: 'pm' },
				}),
			).toBe('Apr. 12, 1985 7:00 PM');
		});

		it('should fill in missing seconds in the tooltip', () => {
			stubParsedModel({
				date: { year: '1985', month: '04', day: '12' },
				time: { hours: '09', minutes: '00', format: 'am' },
				endDate: { year: '1985', month: '06', day: '10' },
				endTime: { format: 'am' },
			});

			expect(service.formatForTooltip('stubbed/stubbed')).toEqual({
				from: 'Apr. 12, 1985 • 9:00:00 AM',
				to: 'Jun. 10, 1985',
			});
		});

		it('should show the zone after the start time of a same-day range whose end has none', () => {
			stubParsedModel({
				date: { year: '2001', month: '09', day: '24' },
				time: { hours: '09', minutes: '45', format: 'am' },
				endDate: { year: '2001', month: '09', day: '24' },
				endTime: { format: 'am' },
			});

			expect(
				service
					.formatForDisplay('stubbed/stubbed', 'America/Chicago')
					.time.map((segment) => segment.text)
					.join(''),
			).toBe('9:45 AM CDT');
		});

		it('should treat a missing date as unknown', () => {
			expect(renderModel({ date: undefined, time: { format: 'am' } })).toBe(
				'Unknown',
			);
		});
	});

	describe('values it cannot parse', () => {
		it('should show the stored string rather than an error', () => {
			expect(dateTextOf('not-a-date')).toBe('not-a-date');
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
			expect(service.formatForTooltip('1985-04-12T23:20:30')).toBeNull();
			expect(service.formatForTooltip('1985-04-12T23:20:00')).toBeNull();
			expect(service.formatForTooltip('1985-04-12')).toBeNull();
			expect(service.formatForTooltip('1985-04-12/1985-06-10')).toBeNull();
			expect(service.formatForTooltip('XXXX-XX-XX')).toBeNull();
			expect(service.formatForTooltip('')).toBeNull();
		});

		it('should not claim a same-day range hides its times', () => {
			expect(
				service.formatForTooltip('2001-09-24T09:45:00Z/2001-09-24T16:00:00Z'),
			).toBeNull();
		});

		it('should keep the qualifier and skip the time on a side without one', () => {
			expect(
				service.formatForTooltip('1985-04-12T09:00:00Z/1985-06-10~'),
			).toEqual({
				from: 'Apr. 12, 1985 • 9:00:00 AM',
				to: 'Jun. 10, 1985 ~',
			});
		});

		it('should say nothing for an absent value', () => {
			expect(service.formatForTooltip(null)).toBeNull();
			expect(service.formatForTooltip(undefined)).toBeNull();
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

		it('should render nothing for an absent date', () => {
			expect(service.formatDateForDisplay(undefined)).toBe('');
		});

		it('should keep the numeric form for a month that does not exist', () => {
			expect(service.formatDateForDisplay({ year: '1985', month: '13' })).toBe(
				'1985-13',
			);

			expect(service.formatDateForDisplay({ year: '1985', month: '00' })).toBe(
				'1985-00',
			);
		});
	});
});
