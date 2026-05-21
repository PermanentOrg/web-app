import { EdtfService, DateTimeModel } from './edtf.service';

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
		});

		describe('time parsing', () => {
			it('should parse time in UTC', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45Z');

				expect(result.time.hours).toBe('02');
				expect(result.time.minutes).toBe('30');
				expect(result.time.seconds).toBe('45');
				expect(result.time.pm).toBe(true);
				expect(result.time.am).toBe(false);
			});

			it('should parse AM time', () => {
				const result = service.toDateTimeModel('1985-05-20T09:15:00Z');

				expect(result.time.hours).toBe('09');
				expect(result.time.am).toBe(true);
				expect(result.time.pm).toBe(false);
			});

			it('should parse midnight as 12 AM', () => {
				const result = service.toDateTimeModel('1985-05-20T00:00:00Z');

				expect(result.time.hours).toBe('12');
				expect(result.time.am).toBe(true);
				expect(result.time.pm).toBe(false);
			});

			it('should parse noon as 12 PM', () => {
				const result = service.toDateTimeModel('1985-05-20T12:00:00Z');

				expect(result.time.hours).toBe('12');
				expect(result.time.am).toBe(false);
				expect(result.time.pm).toBe(true);
			});

			it('should have empty time fields when no time present', () => {
				const result = service.toDateTimeModel('1985-05-20');

				expect(result.time.hours).toBe('');
				expect(result.time.minutes).toBe('');
				expect(result.time.seconds).toBe('');
				expect(result.time.am).toBe(true);
				expect(result.time.pm).toBe(false);
			});
		});

		describe('timezone', () => {
			it('should extract UTC timezone from Z suffix', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45Z');

				expect(result.time.timezoneOffset).toBe('GMT+00:00');
				expect(result.time.timezoneName).toBe('Greenwich Mean Time');
			});

			it('should extract positive timezone offset', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45+05:30');

				expect(result.time.timezoneOffset).toBe('GMT+05:30');
				expect(result.time.timezoneName).toBe('India Standard Time');
			});

			it('should extract negative timezone offset', () => {
				const result = service.toDateTimeModel('1985-05-20T14:30:45-04:00');

				expect(result.time.timezoneOffset).toBe('GMT-04:00');
				expect(result.time.timezoneName).toBe('Atlantic Standard Time');
			});

			it('should have empty timezone when none present', () => {
				const result = service.toDateTimeModel('1985-05-20');

				expect(result.time.timezoneOffset).toBe('');
				expect(result.time.timezoneName).toBe('');
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
		});
	});

	describe('toEdtfDate', () => {
		describe('date building', () => {
			it('should build year-only EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985');
			});

			it('should build year-month EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05');
			});

			it('should build full date EDTF string', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05-20');
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
						am: false,
						pm: true,
						timezoneOffset: '',
						timezoneName: '',
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
						am: true,
						pm: false,
						timezoneOffset: '',
						timezoneName: '',
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
						am: true,
						pm: false,
						timezoneOffset: '',
						timezoneName: '',
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
						am: false,
						pm: true,
						timezoneOffset: '',
						timezoneName: '',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('T12:00:00');
			});

			it('should omit time when hours not provided', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				const result = service.toEdtfDate(model);

				expect(result).not.toContain('T');
			});
		});

		describe('timezone output', () => {
			it('should append timezone offset from GMT format', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '02',
						minutes: '30',
						seconds: '45',
						am: false,
						pm: true,
						timezoneOffset: 'GMT+05:30',
						timezoneName: 'India Standard Time',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('+05:30');
			});

			it('should append negative timezone offset from GMT format', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: {
						hours: '09',
						minutes: '00',
						seconds: '00',
						am: true,
						pm: false,
						timezoneOffset: 'GMT-04:00',
						timezoneName: 'Atlantic Standard Time',
					},
				};

				const result = service.toEdtfDate(model);

				expect(result).toContain('-04:00');
			});

			it('should not append timezone when empty', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				const result = service.toEdtfDate(model);

				expect(result).toBe('1985-05');
			});
		});

		describe('qualifiers output', () => {
			it('should add approximate qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~');
			});

			it('should add uncertain qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: false, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05?');
			});

			it('should add combined qualifier', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05%');
			});

			it('should not add qualifier when none set', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: false, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05');
			});

			it('should return XXXX-XX-XX when unknown qualifier is set', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: false, uncertain: false, unknown: true },
				};

				expect(service.toEdtfDate(model)).toBe('XXXX-XX-XX');
			});
		});

		describe('interval output (range)', () => {
			it('should build a date range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06' },
					endTime: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05/1990-06');
			});

			it('should build a full date range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05', day: '20' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06', day: '15' },
					endTime: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05-20/1990-06-15');
			});

			it('should build a year-only range', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990' },
					endTime: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985/1990');
			});

			it('should apply approximate qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06' },
					endTime: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~/1990-06~');
			});

			it('should apply uncertain qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06' },
					endTime: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: false, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05?/1990-06?');
			});

			it('should apply combined qualifier to both dates in a range', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06' },
					endTime: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: true, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05%/1990-06%');
			});

			it('should apply qualifier only to the start when the end is open', () => {
				const model: DateTimeModel = {
					date: { year: '1985', month: '05' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '', month: '', day: '' },
					endTime: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985-05~/..');
			});

			it('should apply qualifier to both dates with mixed precision', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '1990', month: '06' },
					endTime: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: true, uncertain: false, unknown: false },
				};

				expect(service.toEdtfDate(model)).toBe('1985~/1990-06~');
			});
		});
	});

	describe('interval with different timezones', () => {
		it('should parse different timezones for start and end', () => {
			const result = service.toDateTimeModel(
				'1985-05-20T10:00:00+05:30/1990-06-15T12:00:00-04:00',
			);

			expect(result.time.timezoneOffset).toBe('GMT+05:30');
			expect(result.endTime.timezoneOffset).toBe('GMT-04:00');
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
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(() => service.toEdtfDate(model)).toThrowError(
					/Please check the values/,
				);
			});
		});
	});

	describe('offsetToAbbreviation', () => {
		it('should return known abbreviation for mapped offset', () => {
			expect(EdtfService.offsetToAbbreviation('GMT-05:00')).toBe('EST');
		});

		it('should return known abbreviation for positive offset', () => {
			expect(EdtfService.offsetToAbbreviation('GMT+09:00')).toBe('JST');
		});

		it('should return UTC format for unmapped whole-hour offset', () => {
			expect(EdtfService.offsetToAbbreviation('GMT-02:00')).toBe('UTC-2');
		});

		it('should return UTC format with minutes for unmapped offset with minutes', () => {
			expect(EdtfService.offsetToAbbreviation('GMT+06:30')).toBe('UTC+6:30');
		});

		it('should return the input string for non-GMT format', () => {
			expect(EdtfService.offsetToAbbreviation('invalid')).toBe('invalid');
		});
	});

	describe('buildTzSuffix', () => {
		it('should return empty string for empty input', () => {
			expect(EdtfService.buildTzSuffix('')).toBe('');
		});

		it('should return suffix for whole-hour positive offset', () => {
			expect(EdtfService.buildTzSuffix('GMT+05:00')).toBe('+5');
		});

		it('should return suffix for whole-hour negative offset', () => {
			expect(EdtfService.buildTzSuffix('GMT-08:00')).toBe('-8');
		});

		it('should return suffix with minutes for non-whole-hour offset', () => {
			expect(EdtfService.buildTzSuffix('GMT+05:30')).toBe('+5:30');
		});

		it('should return empty string for non-GMT format', () => {
			expect(EdtfService.buildTzSuffix('invalid')).toBe('');
		});
	});

	describe('isNumeric', () => {
		it('should return true for digit-only string', () => {
			expect(service.isNumeric('12345')).toBe(true);
		});

		it('should return false for string with letters', () => {
			expect(service.isNumeric('12a5')).toBe(false);
		});

		it('should return false for empty string', () => {
			expect(service.isNumeric('')).toBe(false);
		});

		it('should return false for negative number string', () => {
			expect(service.isNumeric('-1')).toBe(false);
		});
	});

	describe('parseTimeAs24Hour', () => {
		it('should convert PM time to 24-hour format', () => {
			const result = service.parseTimeAs24Hour({
				hours: '02',
				minutes: '30',
				seconds: '45',
				pm: true,
			});

			expect(result).toEqual({ hour: 14, minute: 30, second: 45 });
		});

		it('should convert AM time to 24-hour format', () => {
			const result = service.parseTimeAs24Hour({
				hours: '09',
				minutes: '15',
				seconds: '00',
				am: true,
				pm: false,
			});

			expect(result).toEqual({ hour: 9, minute: 15, second: 0 });
		});

		it('should convert 12 PM to 12', () => {
			const result = service.parseTimeAs24Hour({
				hours: '12',
				minutes: '00',
				seconds: '00',
				pm: true,
			});

			expect(result).toEqual({ hour: 12, minute: 0, second: 0 });
		});

		it('should convert 12 AM to 0', () => {
			const result = service.parseTimeAs24Hour({
				hours: '12',
				minutes: '00',
				seconds: '00',
				am: true,
				pm: false,
			});

			expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
		});

		it('should default missing seconds to 0', () => {
			const result = service.parseTimeAs24Hour({
				hours: '05',
				minutes: '30',
				pm: false,
			});

			expect(result.second).toBe(0);
		});

		it('should default missing hours and minutes to 0', () => {
			const result = service.parseTimeAs24Hour({});

			expect(result).toEqual({ hour: 0, minute: 0, second: 0 });
		});

		it('should parse unpadded single-digit hours', () => {
			const result = service.parseTimeAs24Hour({
				hours: '7',
				minutes: '5',
				seconds: '3',
				am: true,
				pm: false,
			});

			expect(result).toEqual({ hour: 7, minute: 5, second: 3 });
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
	});
});
