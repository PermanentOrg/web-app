import { EdtfService, DateTimeModel } from './edtf.service';

// Mirrors the service's local-offset stamping so the expectations stay
// green in any timezone the tests run in.
const localTimezoneOffset = (): string => {
	const offsetMinutes = -new Date().getTimezoneOffset();
	const sign = offsetMinutes < 0 ? '-' : '+';
	const absoluteMinutes = Math.abs(offsetMinutes);
	const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0');
	const minutes = String(absoluteMinutes % 60).padStart(2, '0');
	return `${sign}${hours}:${minutes}`;
};

describe('EdtfService', () => {
	let service: EdtfService;

	beforeEach(() => {
		service = new EdtfService();
	});

	describe('toDateTimeModel', () => {
		describe('date parsing', () => {
			it('should parse year only', () => {
				const result = service.toDateTimeModel('1985');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('');
				expect(result.date.day).toBe('');
			});

			it('should parse year-month', () => {
				const result = service.toDateTimeModel('1985-05');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('');
			});

			it('should parse full date', () => {
				const result = service.toDateTimeModel('1985-05-20');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('20');
			});
		});

		describe('unspecified fields', () => {
			it('should set month to empty when XX', () => {
				const result = service.toDateTimeModel('1985-XX');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('');
			});

			it('should set day to empty when XX', () => {
				const result = service.toDateTimeModel('1985-05-XX');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('');
			});

			it('should set unknown qualifier to true when whole date is unspecified', () => {
				const result = service.toDateTimeModel('XXXX');

				expect(result.qualifiers.unknown).toBe(true);
			});

			it('should parse XXXX-XX-XX as unknown', () => {
				const result = service.toDateTimeModel('XXXX-XX-XX');

				expect(result.qualifiers.unknown).toBe(true);
				expect(result.date.year).toBe('');
				expect(result.date.month).toBe('');
				expect(result.date.day).toBe('');
				expect(result.time.hours).toBe('');
			});

			it('should set unknown qualifier to false when partially unspecified', () => {
				const result = service.toDateTimeModel('1985-XX');

				expect(result.qualifiers.unknown).toBe(false);
			});

			it('should set unknown qualifier to false when fully specified', () => {
				const result = service.toDateTimeModel('1985-05');

				expect(result.qualifiers.unknown).toBe(false);
			});

			it('should strip trailing X from partial year', () => {
				const result = service.toDateTimeModel('198X');

				expect(result.date.year).toBe('198');
				expect(result.date.month).toBe('');
			});

			it('should strip trailing X from partial month', () => {
				const result = service.toDateTimeModel('1985-1X');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('1');
			});

			it('should strip trailing X from partial day', () => {
				const result = service.toDateTimeModel('1985-05-2X');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('2');
			});

			it('should parse XXXX-05 as month-only', () => {
				const result = service.toDateTimeModel('XXXX-05');

				expect(result.date.year).toBe('');
				expect(result.date.month).toBe('05');
			});

			it('should parse 198X-05-20 as partial year with full month and day', () => {
				const result = service.toDateTimeModel('198X-05-20');

				expect(result.date.year).toBe('198');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('20');
			});
		});

		describe('time parsing', () => {
			it('should parse time in UTC', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45Z');

				expect(result.time.hours).toBe('02');
				expect(result.time.minutes).toBe('30');
				expect(result.time.seconds).toBe('45');
				expect(result.time.format).toBe('pm');
			});

			it('should parse AM time', () => {
				const result = service.toDateTimeModel('1985-05-20T09:15:00Z');

				expect(result.time.hours).toBe('09');
				expect(result.time.format).toBe('am');
			});

			it('should parse midnight as 12 AM', () => {
				const result = service.toDateTimeModel('1985-05-20T00:00:00Z');

				expect(result.time.hours).toBe('12');
				expect(result.time.format).toBe('am');
			});

			it('should parse noon as 12 PM', () => {
				const result = service.toDateTimeModel('1985-05-20T12:00:00Z');

				expect(result.time.hours).toBe('12');
				expect(result.time.format).toBe('pm');
			});

			it('should have empty time fields when no time present', () => {
				const result = service.toDateTimeModel('1985-05-20');

				expect(result.time.hours).toBe('');
				expect(result.time.minutes).toBe('');
				expect(result.time.seconds).toBe('');
				expect(result.time.format).toBe('am');
			});

			it('should parse time with a timezone offset suffix as local wall-clock time', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45+05:30');

				expect(result.time.hours).toBe('02');
				expect(result.time.minutes).toBe('30');
				expect(result.time.seconds).toBe('45');
				expect(result.time.format).toBe('pm');
			});

			it('should preserve the timezone offset suffix in the model', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45+05:30');

				expect(result.time.timezoneOffset).toBe('+05:30');
			});

			it('should not set a timezone offset for unmarked or Z-marked times', () => {
				const unmarked = service.toDateTimeModel('1985-05-20T14:30:45');
				const utcMarked = service.toDateTimeModel('1985-05-20T14:30:45Z');

				expect(unmarked.time.timezoneOffset).toBeUndefined();
				expect(utcMarked.time.timezoneOffset).toBeUndefined();
			});

			it('should preserve the date parts of an early-morning unmarked time', () => {
				// Regression: without normalization the edtf library treats the
				// value as browser-local and converts it to UTC, which can shift
				// the date parts across midnight.
				const result = service.toDateTimeModel('1985-05-20T01:00:00');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('20');
				expect(result.time.hours).toBe('01');
			});

			it('should preserve the date parts of an early-morning offset-marked time', () => {
				const result = service.toDateTimeModel('1985-05-20T01:00:00+05:30');

				expect(result.date.day).toBe('20');
				expect(result.time.hours).toBe('01');
			});

			it('should preserve wall-clock time when no timezone marker is present', () => {
				// Regression: edtf treats unmarked datetimes as local time and
				// shifts them to UTC, which mangles the displayed wall-clock
				// value in any non-UTC timezone.
				const result = service.toDateTimeModel('1985-05-20T23:23:23');

				expect(result.time.hours).toBe('11');
				expect(result.time.minutes).toBe('23');
				expect(result.time.seconds).toBe('23');
				expect(result.time.format).toBe('pm');
			});

			it('should preserve wall-clock time when input has milliseconds and Z', () => {
				// The folder/record VO normalizer rewrites BE values like
				// '1985-05-20T23:23:23' to '1985-05-20T23:23:23.000Z'.
				const result = service.toDateTimeModel('1985-05-20T23:23:23.000Z');

				expect(result.time.hours).toBe('11');
				expect(result.time.minutes).toBe('23');
				expect(result.time.seconds).toBe('23');
				expect(result.time.format).toBe('pm');
			});
		});

		describe('qualifiers', () => {
			it('should detect approximate qualifier', () => {
				const result = service.toDateTimeModel('1985-05~');

				expect(result.qualifiers.approximate).toBe(true);
				expect(result.qualifiers.uncertain).toBe(false);
			});

			it('should detect uncertain qualifier', () => {
				const result = service.toDateTimeModel('1985-05?');

				expect(result.qualifiers.uncertain).toBe(true);
				expect(result.qualifiers.approximate).toBe(false);
			});

			it('should detect combined approximate and uncertain qualifier', () => {
				const result = service.toDateTimeModel('1985-05%');

				expect(result.qualifiers.approximate).toBe(true);
				expect(result.qualifiers.uncertain).toBe(true);
			});

			it('should have no qualifiers for plain date', () => {
				const result = service.toDateTimeModel('1985-05');

				expect(result.qualifiers.approximate).toBe(false);
				expect(result.qualifiers.uncertain).toBe(false);
				expect(result.qualifiers.unknown).toBe(false);
			});
		});

		describe('interval (range)', () => {
			it('should parse a year-month range', () => {
				const result = service.toDateTimeModel('1985-05/1990-06');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.endDate.year).toBe('1990');
				expect(result.endDate.month).toBe('06');
			});

			it('should parse a full date range', () => {
				const result = service.toDateTimeModel('1985-05-20/1990-06-15');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('05');
				expect(result.date.day).toBe('20');
				expect(result.endDate.year).toBe('1990');
				expect(result.endDate.month).toBe('06');
				expect(result.endDate.day).toBe('15');
			});

			it('should parse a year-only range', () => {
				const result = service.toDateTimeModel('1985/1990');

				expect(result.date.year).toBe('1985');
				expect(result.date.month).toBe('');
				expect(result.endDate.year).toBe('1990');
				expect(result.endDate.month).toBe('');
			});

			it('should parse an interval with timezone suffixes and preserve each offset', () => {
				const result = service.toDateTimeModel(
					'1985-05-20T10:00:00+05:30/1990-06-15T12:00:00-04:00',
				);

				expect(result.date.year).toBe('1985');
				expect(result.endDate.year).toBe('1990');
				expect(result.time.timezoneOffset).toBe('+05:30');
				expect(result.endTime.timezoneOffset).toBe('-04:00');
			});
		});
	});

	describe('toEdtfDate', () => {
		describe('date building', () => {
			it('should build year-only EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985');
			});

			it('should build year-month EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05');
			});

			it('should build full date EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05-20');
			});
		});

		describe('unspecified-digit (X-padding)', () => {
			it('should pad 3-digit year with one X', () => {
				const model: DateTimeModel = {
					date: { year: '198' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('198X');
			});

			it('should pad 2-digit year with two Xs', () => {
				const model: DateTimeModel = {
					date: { year: '19' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('19XX');
			});

			it('should emit XXXX when only month has digits', () => {
				const model: DateTimeModel = {
					date: { year: '', month: '05' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('XXXX-05');
			});

			it('should emit XXXX-XX-20 when only day has digits', () => {
				const model: DateTimeModel = {
					date: { year: '', month: '', day: '20' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('XXXX-XX-20');
			});

			it('should emit 1985-XX-20 when month is missing but day is present', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '', day: '20' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-XX-20');
			});

			it('should pad single-digit day with one X', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '2' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05-2X');
			});

			it('should pad single-digit month with one X', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '1' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-1X');
			});

			it('should combine partial year, full month, and full day', () => {
				const model: DateTimeModel = {
					date: { year: '198', month: '05', day: '20' },
					time: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('198X-05-20');
			});
		});

		describe('time building', () => {
			it('should build date with PM time', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '02',
						minutes: '30',
						seconds: '45',
						format: 'pm',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T14:30:45');
			});

			it('should build date with AM time', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '09',
						minutes: '15',
						seconds: '00',
						format: 'am',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T09:15:00');
			});

			it('should convert 12 AM to 00 (midnight)', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '12',
						minutes: '00',
						seconds: '00',
						format: 'am',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T00:00:00');
			});

			it('should keep 12 PM as 12 (noon)', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '12',
						minutes: '00',
						seconds: '00',
						format: 'pm',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T12:00:00');
			});

			it('should build a date with a raw 24-hour time', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '14',
						minutes: '30',
						seconds: '45',
						format: 'h24',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T14:30:45');
			});

			it('should omit time when hours not provided', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { format: 'am' },
				};

				const result = service.toEdtfDate(model);

				expect(result).not.toContain('T');
			});

			it('should preserve the timezone offset stored in the model', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '02',
						minutes: '30',
						seconds: '45',
						format: 'pm',
						timezoneOffset: '+05:30',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toBe('1985-05-20T14:30:45+05:30');
			});

			it('should stamp the local timezone offset when the model has none', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '02',
						minutes: '30',
						seconds: '45',
						format: 'pm',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toBe(`1985-05-20T14:30:45${localTimezoneOffset()}`);
			});
		});

		describe('qualifiers output', () => {
			it('should add approximate qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~');
			});

			it('should add uncertain qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					qualifiers: { approximate: false, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05?');
			});

			it('should add combined qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					qualifiers: { approximate: true, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05%');
			});

			it('should not add qualifier when none set', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					qualifiers: { approximate: false, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05');
			});

			it('should return XXXX-XX-XX when unknown qualifier is set', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { format: 'am' },
					qualifiers: { approximate: false, uncertain: false, unknown: true },
				};

				expect(service.toEdtfDate(model)).toBe('XXXX-XX-XX');
			});
		});

		describe('interval output (range)', () => {
			it('should build a date range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06' },
					endTime: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05/1990-06');
			});

			it('should build a full date range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06', day: '15' },
					endTime: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05-20/1990-06-15');
			});

			it('should build a year-only range', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { format: 'am' },
					endDate: { year: '1990' },
					endTime: { format: 'am' },
				};

				expect(service.toEdtfDate(model)).toBe('1985/1990');
			});

			it('should apply approximate qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06' },
					endTime: { format: 'am' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~/1990-06~');
			});

			it('should apply uncertain qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06' },
					endTime: { format: 'am' },
					qualifiers: { approximate: false, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05?/1990-06?');
			});

			it('should apply combined qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06' },
					endTime: { format: 'am' },
					qualifiers: { approximate: true, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05%/1990-06%');
			});

			it('should apply qualifier only to the start when the end is open', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { format: 'am' },
					endDate: { year: '', month: '', day: '' },
					endTime: { format: 'am' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~/..');
			});

			it('should apply qualifier to both dates with mixed precision', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { format: 'am' },
					endDate: { year: '1990', month: '06' },
					endTime: { format: 'am' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985~/1990-06~');
			});
		});
	});

	describe('error handling', () => {
		describe('parsing errors', () => {
			it('should throw a human-readable error for completely invalid EDTF string', () => {
				expect(() => service.toDateTimeModel('not-a-date')).toThrowError();
			});

			it('should return null for invalid interval string', () => {
				const result = service.toDateTimeModel('invalid/also-invalid');

				expect(result).toBeNull();
			});

			it('should return null for empty string', () => {
				const result = service.toDateTimeModel('');

				expect(result).toBeNull();
			});
		});

		describe('formatting errors', () => {
			it('should throw a generic human-readable error for invalid dates', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '99' },
					time: { format: 'am' },
				};

				expect(() => service.toEdtfDate(model)).toThrowError(
					/Please check the values/,
				);
			});
		});
	});

	describe('browserTimezoneAbbreviation', () => {
		const stubTimezoneName = (timezoneName: string): void => {
			spyOn(Intl, 'DateTimeFormat').and.returnValue({
				formatToParts: () => [{ type: 'timeZoneName', value: timezoneName }],
			} as unknown as Intl.DateTimeFormat);
		};

		const sampleDate = { year: '1985', month: '05', day: '20' };
		const sampleTime = {
			hours: '02',
			minutes: '30',
			seconds: '00',
			format: 'pm' as const,
		};

		it('should return empty string when time has no hours', () => {
			const result = service.browserTimezoneAbbreviation(sampleDate, {
				hours: '',
				format: 'am',
			});

			expect(result).toBe('');
		});

		it('should keep named abbreviations unchanged', () => {
			stubTimezoneName('EDT');

			expect(service.browserTimezoneAbbreviation(sampleDate, sampleTime)).toBe(
				'EDT',
			);
		});

		it('should pad a whole-hour offset to +/-HH:MM', () => {
			stubTimezoneName('GMT+3');

			expect(service.browserTimezoneAbbreviation(sampleDate, sampleTime)).toBe(
				'GMT+03:00',
			);
		});

		it('should pad a half-hour positive offset to +/-HH:MM', () => {
			stubTimezoneName('GMT+5:30');

			expect(service.browserTimezoneAbbreviation(sampleDate, sampleTime)).toBe(
				'GMT+05:30',
			);
		});

		it('should pad a negative offset to +/-HH:MM', () => {
			stubTimezoneName('GMT-9:30');

			expect(service.browserTimezoneAbbreviation(sampleDate, sampleTime)).toBe(
				'GMT-09:30',
			);
		});

		it('should leave an already-normalized offset unchanged', () => {
			stubTimezoneName('GMT+03:00');

			expect(service.browserTimezoneAbbreviation(sampleDate, sampleTime)).toBe(
				'GMT+03:00',
			);
		});
	});

	describe('parseTimeAs24Hour', () => {
		it('should convert PM time to 24-hour format', () => {
			const result = service.parseTimeAs24Hour({
				hours: '02',
				minutes: '30',
				seconds: '45',
				format: 'pm',
			});

			expect(result).toEqual({ hour: 14, minute: 30, second: 45 });
		});

		it('should convert AM time to 24-hour format', () => {
			const result = service.parseTimeAs24Hour({
				hours: '09',
				minutes: '15',
				seconds: '00',
				format: 'am',
			});

			expect(result).toEqual({ hour: 9, minute: 15, second: 0 });
		});

		it('should convert 12 PM to 12', () => {
			const result = service.parseTimeAs24Hour({
				hours: '12',
				minutes: '00',
				seconds: '00',
				format: 'pm',
			});

			expect(result).toEqual({ hour: 12, minute: 0, second: 0 });
		});

		it('should convert 12 AM to 0', () => {
			const result = service.parseTimeAs24Hour({
				hours: '12',
				minutes: '00',
				seconds: '00',
				format: 'am',
			});

			expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
		});

		it('should default missing seconds to 0', () => {
			const result = service.parseTimeAs24Hour({
				hours: '05',
				minutes: '30',
				format: 'am',
			});

			expect(result.second).toBe(0);
		});

		it('should default missing hours and minutes to 0', () => {
			const result = service.parseTimeAs24Hour({ format: 'am' });

			expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
		});

		it('should parse unpadded single-digit hours', () => {
			const result = service.parseTimeAs24Hour({
				hours: '7',
				minutes: '5',
				seconds: '3',
				format: 'am',
			});

			expect(result).toEqual({ hour: 7, minute: 5, second: 3 });
		});

		it('should pass through 24h hours directly', () => {
			const result = service.parseTimeAs24Hour({
				hours: '14',
				minutes: '30',
				seconds: '45',
				format: 'h24',
			});

			expect(result).toEqual({ hour: 14, minute: 30, second: 45 });
		});

		it('should handle 00 hours in h24 mode', () => {
			const result = service.parseTimeAs24Hour({
				hours: '00',
				minutes: '00',
				seconds: '00',
				format: 'h24',
			});

			expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
		});

		it('should handle 23 hours in h24 mode', () => {
			const result = service.parseTimeAs24Hour({
				hours: '23',
				minutes: '59',
				seconds: '59',
				format: 'h24',
			});

			expect(result).toEqual({ hour: 23, minute: 59, second: 59 });
		});
	});

	describe('isValidHour', () => {
		it('should validate single digit hour', () => {
			expect(service.isValidHour('0')).toBe(true);
			expect(service.isValidHour('1')).toBe(true);
			expect(service.isValidHour('2')).toBe(false);
		});

		it('should return true for valid 2-digit hour 01', () => {
			expect(service.isValidHour('01')).toBe(true);
			expect(service.isValidHour('12')).toBe(true);
		});

		it('should return false for hour 13', () => {
			expect(service.isValidHour('13')).toBe(false);
		});

		it('should return false for hour 00', () => {
			expect(service.isValidHour('00')).toBe(false);
		});

		it('should return false for non-numeric input', () => {
			expect(service.isValidHour('ab')).toBe(false);
		});

		it('should return false for input longer than 2 digits', () => {
			expect(service.isValidHour('123')).toBe(false);
		});

		describe('h24 mode', () => {
			it('should accept single digits 0-2', () => {
				expect(service.isValidHour('0', true)).toBe(true);
				expect(service.isValidHour('1', true)).toBe(true);
				expect(service.isValidHour('2', true)).toBe(true);
			});

			it('should reject single digit greater than 2', () => {
				expect(service.isValidHour('3', true)).toBe(false);
				expect(service.isValidHour('9', true)).toBe(false);
			});

			it('should accept 2-digit hours 00-23', () => {
				expect(service.isValidHour('00', true)).toBe(true);
				expect(service.isValidHour('13', true)).toBe(true);
				expect(service.isValidHour('23', true)).toBe(true);
			});

			it('should reject hours 24 and above', () => {
				expect(service.isValidHour('24', true)).toBe(false);
				expect(service.isValidHour('30', true)).toBe(false);
				expect(service.isValidHour('99', true)).toBe(false);
			});

			it('should reject non-numeric input', () => {
				expect(service.isValidHour('ab', true)).toBe(false);
			});
		});
	});

	describe('isValidMinutesSeconds', () => {
		it('should validate single digit minutes or seconds', () => {
			expect(service.isValidMinutesSeconds('0')).toBe(true);
			expect(service.isValidMinutesSeconds('5')).toBe(true);
			expect(service.isValidMinutesSeconds('6')).toBe(false);
		});

		it('should validate 2-digit minutes or seconds', () => {
			expect(service.isValidMinutesSeconds('00')).toBe(true);
			expect(service.isValidMinutesSeconds('59')).toBe(true);
			expect(service.isValidMinutesSeconds('60')).toBe(false);
		});

		it('should reject non-numeric minutes or seconds', () => {
			expect(service.isValidMinutesSeconds('ab')).toBe(false);
		});

		it('should reject minutes or seconds longer than 2 digits', () => {
			expect(service.isValidMinutesSeconds('123')).toBe(false);
		});
	});

	describe('isValidYear', () => {
		it('should accept empty year', () => {
			expect(service.isValidYear('')).toBe(true);
		});

		it('should accept a 4-digit year', () => {
			expect(service.isValidYear('1985')).toBe(true);
		});

		it('should accept partial year input (progressive)', () => {
			expect(service.isValidYear('1')).toBe(true);
			expect(service.isValidYear('19')).toBe(true);
			expect(service.isValidYear('198')).toBe(true);
		});

		it('should accept ISO 8601 year padded with leading zeros', () => {
			expect(service.isValidYear('0985')).toBe(true);
		});

		it('should accept leading zero(s) as progressive input', () => {
			expect(service.isValidYear('0')).toBe(true);
			expect(service.isValidYear('00')).toBe(true);
			expect(service.isValidYear('000')).toBe(true);
			expect(service.isValidYear('0000')).toBe(true);
		});

		it('should reject non-numeric year', () => {
			expect(service.isValidYear('abcd')).toBe(false);
			expect(service.isValidYear('19ab')).toBe(false);
		});

		it('should reject year longer than 4 digits', () => {
			expect(service.isValidYear('12345')).toBe(false);
		});
	});

	describe('isValidMonth', () => {
		it('should accept empty month', () => {
			expect(service.isValidMonth('')).toBe(true);
		});

		it('should accept a valid 2-digit month', () => {
			expect(service.isValidMonth('01')).toBe(true);
			expect(service.isValidMonth('12')).toBe(true);
		});

		it('should accept 0 or 1 as a progressive single digit', () => {
			expect(service.isValidMonth('0')).toBe(true);
			expect(service.isValidMonth('1')).toBe(true);
		});

		it('should reject single digit greater than 1', () => {
			expect(service.isValidMonth('2')).toBe(false);
			expect(service.isValidMonth('9')).toBe(false);
		});

		it('should reject month 00', () => {
			expect(service.isValidMonth('00')).toBe(false);
		});

		it('should reject month greater than 12', () => {
			expect(service.isValidMonth('13')).toBe(false);
		});

		it('should reject non-numeric month', () => {
			expect(service.isValidMonth('ab')).toBe(false);
		});

		it('should reject month longer than 2 digits', () => {
			expect(service.isValidMonth('123')).toBe(false);
		});
	});

	describe('isValidDay', () => {
		it('should accept empty day', () => {
			expect(service.isValidDay('', '1985', '05')).toBe(true);
		});

		it('should accept a valid 2-digit day for the month', () => {
			expect(service.isValidDay('20', '1985', '05')).toBe(true);
		});

		it('should accept Feb 29 in a leap year', () => {
			expect(service.isValidDay('29', '2024', '02')).toBe(true);
		});

		it('should reject Feb 29 in a non-leap year', () => {
			expect(service.isValidDay('29', '1985', '02')).toBe(false);
		});

		it('should reject Feb 30', () => {
			expect(service.isValidDay('30', '1985', '02')).toBe(false);
		});

		it('should reject day 31 in a 30-day month', () => {
			expect(service.isValidDay('31', '1985', '04')).toBe(false);
		});

		it('should reject day 00', () => {
			expect(service.isValidDay('00', '1985', '05')).toBe(false);
		});

		it('should reject day greater than 31', () => {
			expect(service.isValidDay('32', '1985', '01')).toBe(false);
		});

		it('should reject non-numeric day', () => {
			expect(service.isValidDay('ab', '1985', '05')).toBe(false);
		});

		it('should accept single digit as progressive day input', () => {
			expect(service.isValidDay('3', '1985', '05')).toBe(true);
		});

		it('should fall back to leap year 2000 when year is missing', () => {
			// 2000 is a leap year so Feb 29 is allowed
			expect(service.isValidDay('29', '', '02')).toBe(true);
		});

		it('should fall back to month 01 (31 days) when month is missing', () => {
			expect(service.isValidDay('31', '1985', '')).toBe(true);
		});
	});

	describe('roundtrip', () => {
		it('should roundtrip a full date', () => {
			const edtfString = '1985-05-20';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip year-month', () => {
			const edtfString = '1985-05';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip year only', () => {
			const edtfString = '1985';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip approximate qualifier', () => {
			const edtfString = '1985-05~';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip uncertain qualifier', () => {
			const edtfString = '1985-05?';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip combined qualifier', () => {
			const edtfString = '1985-05%';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip a date range', () => {
			const edtfString = '1985-05/1990-06';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip a full date-time with a timezone offset unchanged', () => {
			const edtfString = '1985-05-20T23:23:23+05:30';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should stamp the local offset on a date-time without timezone marker', () => {
			const model = service.toDateTimeModel('1985-05-20T23:23:23');
			const result = service.toEdtfDate(model);

			expect(result).toBe(`1985-05-20T23:23:23${localTimezoneOffset()}`);
		});

		it('should replace a fabricated Z marker with the local offset', () => {
			// The folder/record VO layer rewrites offset-less values to
			// '….000Z', so Z is treated as "no offset" rather than real UTC.
			const model = service.toDateTimeModel('1985-05-20T23:23:23.000Z');
			const result = service.toEdtfDate(model);

			expect(result).toBe(`1985-05-20T23:23:23${localTimezoneOffset()}`);
		});

		it('should roundtrip partial year (198X)', () => {
			const edtfString = '198X';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip month-only with unknown year (XXXX-05)', () => {
			const edtfString = 'XXXX-05';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip known year and day with unknown month (1985-XX-20)', () => {
			const edtfString = '1985-XX-20';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip partial day (1985-05-2X)', () => {
			const edtfString = '1985-05-2X';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});

		it('should roundtrip partial year with full month and day (198X-05-20)', () => {
			const edtfString = '198X-05-20';
			const model = service.toDateTimeModel(edtfString);
			const result = service.toEdtfDate(model);

			expect(result).toBe(edtfString);
		});
	});
});
