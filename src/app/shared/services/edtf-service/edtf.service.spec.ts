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

		describe('partial year', () => {
			it('should return only known digits for partial year', () => {
				const result = service.toDateTimeModel('19XX');

				expect(result.date.year).toBe('19');
				expect(result.date.month).toBe('');
				expect(result.date.day).toBe('');
			});

			it('should return single digit for mostly unknown year', () => {
				const result = service.toDateTimeModel('1XXX');

				expect(result.date.year).toBe('1');
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

			it('should parse open start interval', () => {
				const result = service.toDateTimeModel('../1985');

				expect(result.date.year).toBe('');
				expect(result.time.hours).toBeUndefined();
				expect(result.endDate.year).toBe('1985');
			});

			it('should parse open end interval', () => {
				const result = service.toDateTimeModel('1985/..');

				expect(result.date.year).toBe('1985');
				expect(result.endDate.year).toBe('');
				expect(result.endTime.hours).toBeUndefined();
			});

			it('should parse open start with full end date', () => {
				const result = service.toDateTimeModel('../1985-05-20');

				expect(result.date.year).toBe('');
				expect(result.endDate.year).toBe('1985');
				expect(result.endDate.month).toBe('05');
				expect(result.endDate.day).toBe('20');
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

		describe('partial year output', () => {
			it('should pad partial year with X', () => {
				const model: DateTimeModel = {
					date: { year: '19' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('19XX');
			});

			it('should pad single digit year with X', () => {
				const model: DateTimeModel = {
					date: { year: '1' },
					time: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1XXX');
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
					date: { year: '', month: '', day: '' },
					time: { timezoneOffset: '', timezoneName: '' },
					qualifiers: { approximate: false, uncertain: false, unknown: true },
				};

				expect(service.toEdtfDate(model)).toBe('XXXX-XX-XX');
			});

			it('should return XXXX-XX-XX when all fields are empty', () => {
				const model: DateTimeModel = {
					date: { year: '', month: '', day: '' },
					time: { timezoneOffset: '', timezoneName: '' },
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

			it('should build open end interval', () => {
				const model: DateTimeModel = {
					date: { year: '1985' },
					time: { timezoneOffset: '', timezoneName: '' },
					endDate: { year: '' },
					endTime: { timezoneOffset: '', timezoneName: '' },
				};

				expect(service.toEdtfDate(model)).toBe('1985/..');
			});
		});
	});

	describe('isValidDate', () => {
		it('should return true for a valid full date', () => {
			expect(
				service.isValidDate({ year: '1985', month: '05', day: '20' }),
			).toBe(true);
		});

		it('should return true for a valid year-month', () => {
			expect(service.isValidDate({ year: '1985', month: '05', day: '' })).toBe(
				true,
			);
		});

		it('should return true for a valid year only', () => {
			expect(service.isValidDate({ year: '1985', month: '', day: '' })).toBe(
				true,
			);
		});

		it('should return true for a partial year', () => {
			expect(service.isValidDate({ year: '19', month: '', day: '' })).toBe(
				true,
			);
		});

		it('should return false for an invalid month', () => {
			expect(service.isValidDate({ year: '1985', month: '13', day: '' })).toBe(
				false,
			);
		});

		it('should return false for an invalid day', () => {
			expect(
				service.isValidDate({ year: '1985', month: '05', day: '32' }),
			).toBe(false);
		});

		it('should return false for an empty year', () => {
			expect(service.isValidDate({ year: '', month: '', day: '' })).toBe(false);
		});
	});

	describe('isValidTime', () => {
		it('should return true for a valid PM time', () => {
			expect(
				service.isValidTime({
					hours: '02',
					minutes: '30',
					seconds: '45',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(true);
		});

		it('should return true for a valid AM time', () => {
			expect(
				service.isValidTime({
					hours: '09',
					minutes: '15',
					seconds: '00',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(true);
		});

		it('should return true for midnight (12 AM)', () => {
			expect(
				service.isValidTime({
					hours: '12',
					minutes: '00',
					seconds: '00',
					am: true,
					pm: false,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(true);
		});

		it('should return true for noon (12 PM)', () => {
			expect(
				service.isValidTime({
					hours: '12',
					minutes: '00',
					seconds: '00',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(true);
		});

		it('should return true when no hours provided', () => {
			expect(
				service.isValidTime({
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(true);
		});

		it('should return false for invalid hours', () => {
			expect(
				service.isValidTime({
					hours: '13',
					minutes: '00',
					seconds: '00',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(false);
		});

		it('should return false for invalid minutes', () => {
			expect(
				service.isValidTime({
					hours: '02',
					minutes: '60',
					seconds: '00',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(false);
		});

		it('should return false for invalid seconds', () => {
			expect(
				service.isValidTime({
					hours: '02',
					minutes: '30',
					seconds: '60',
					am: false,
					pm: true,
					timezoneOffset: '',
					timezoneName: '',
				}),
			).toBe(false);
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

		it('should roundtrip partial year', () => {
			const edtfString = '19XX';
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
