import { TimezoneService } from './timezone.service';

describe('TimezoneService', () => {
	let service: TimezoneService;

	beforeEach(() => {
		service = new TimezoneService();
	});

	describe('resolveTimezoneId', () => {
		it('should return null for values that are not non-empty strings', () => {
			expect(service.resolveTimezoneId(undefined)).toBeNull();
			expect(service.resolveTimezoneId(null)).toBeNull();
			expect(service.resolveTimezoneId('')).toBeNull();
			expect(service.resolveTimezoneId('   ')).toBeNull();
			expect(service.resolveTimezoneId(0)).toBeNull();
			expect(service.resolveTimezoneId(123)).toBeNull();
			expect(service.resolveTimezoneId({})).toBeNull();
			expect(service.resolveTimezoneId([])).toBeNull();
			expect(service.resolveTimezoneId(true)).toBeNull();
		});

		it('should return null for strings that are not timezone identifiers', () => {
			expect(service.resolveTimezoneId('Not/AZone')).toBeNull();
			expect(service.resolveTimezoneId('Europe')).toBeNull();
			expect(service.resolveTimezoneId('GMT+02:00')).toBeNull();
		});

		it('should return the identifier for a supported zone', () => {
			expect(service.resolveTimezoneId('Europe/Bucharest')).toEqual(
				'Europe/Bucharest',
			);
		});

		it('should trim surrounding whitespace', () => {
			expect(service.resolveTimezoneId('  Europe/Berlin  ')).toEqual(
				'Europe/Berlin',
			);
		});

		it('should canonicalize casing', () => {
			expect(service.resolveTimezoneId('europe/berlin')).toEqual(
				'Europe/Berlin',
			);
		});

		it('should accept identifiers missing from the supported list', () => {
			expect(service.resolveTimezoneId('UTC')).toEqual('UTC');
			expect(service.resolveTimezoneId('Etc/UTC')).toEqual('UTC');
		});
	});

	describe('getGroupedOptions', () => {
		it('should group zones by the leading segment of the identifier', () => {
			const groups = service.getGroupedOptions();
			const europe = groups.find((group) => group.region === 'Europe');

			expect(europe).toBeTruthy();
			expect(
				europe.options.some(
					(option) => option.timezoneId === 'Europe/Bucharest',
				),
			).toBeTrue();

			expect(
				europe.options.every((option) =>
					option.timezoneId.startsWith('Europe/'),
				),
			).toBeTrue();
		});

		it('should sort regions and the options inside them', () => {
			const groups = service.getGroupedOptions();
			const regions = groups.map((group) => group.region);

			expect(regions).toEqual([...regions].sort());
			groups.forEach((group) => {
				const identifiers = group.options.map((option) => option.timezoneId);

				expect(identifiers).toEqual(
					[...identifiers].sort((a, b) => a.localeCompare(b)),
				);
			});
		});

		it('should return the same memoized instance on repeated calls', () => {
			expect(service.getGroupedOptions()).toBe(service.getGroupedOptions());
		});
	});

	describe('getOption', () => {
		it('should return null for an unusable value', () => {
			expect(service.getOption(undefined)).toBeNull();
			expect(service.getOption('Not/AZone')).toBeNull();
			expect(service.getOption(42)).toBeNull();
		});

		it('should describe a supported zone', () => {
			const option = service.getOption('Europe/Bucharest');

			expect(option.timezoneId).toEqual('Europe/Bucharest');
			expect(option.region).toEqual('Europe');
			expect(option.offsetLabel).toMatch(/^GMT[+-]\d{2}:\d{2}$/);
		});

		it('should build an option for a resolvable zone missing from the list', () => {
			const option = service.getOption('UTC');

			expect(option.timezoneId).toEqual('UTC');
			expect(option.offsetLabel).toEqual('GMT+00:00');
		});

		it('should report a bare GMT zone as GMT+00:00', () => {
			expect(service.getOption('Africa/Accra').offsetLabel).toEqual(
				'GMT+00:00',
			);
		});

		it('should name the country the zone belongs to', () => {
			expect(service.getOption('Africa/Accra').countryName).toEqual('Ghana');
			expect(service.getOption('Europe/Bucharest').countryName).toEqual(
				'Romania',
			);

			expect(service.getOption('America/New_York').countryName).toEqual(
				'United States',
			);
		});

		it('should resolve a country for every supported zone', () => {
			const withoutCountry = service
				.getGroupedOptions()
				.flatMap((group) => group.options)
				.filter((option) => !option.countryName);

			expect(withoutCountry).toEqual([]);
		});

		it('should leave the country blank for a zone that belongs to none', () => {
			expect(service.getOption('UTC').countryName).toEqual('');
		});

		it('should cover the identifier, the display name, the country and the offset in the search text', () => {
			const option = service.getOption('Europe/Bucharest');

			expect(option.searchText).toContain('bucharest');
			expect(option.searchText).toContain('europe');
			expect(option.searchText).toContain('eastern european time');
			expect(option.searchText).toContain('romania');
			expect(option.searchText).toContain(option.offsetLabel.toLowerCase());
		});

		it('should space out the separators so a city name is searchable', () => {
			expect(service.getOption('America/New_York').searchText).toContain(
				'new york',
			);
		});

		it('should still build a search text when no display name is available', () => {
			spyOn(
				service as unknown as { extractTimezoneNamePart: () => string },
				'extractTimezoneNamePart',
			).and.returnValue('');

			expect(
				service.getOption('America/Argentina/La_Rioja').searchText,
			).toContain('la rioja');
		});
	});

	describe('getOffsetForWallClock', () => {
		const noon = { month: 5, day: 12, hour: 12, minute: 45, second: 0 };

		it('should return null for an unusable identifier', () => {
			expect(
				service.getOffsetForWallClock('Not/AZone', { ...noon, year: 1985 }),
			).toBeNull();

			expect(
				service.getOffsetForWallClock(undefined, { ...noon, year: 1985 }),
			).toBeNull();

			expect(
				service.getOffsetForWallClock(null, { ...noon, year: 1985 }),
			).toBeNull();
		});

		it('should use the offset the zone was on at that date', () => {
			expect(
				service.getOffsetForWallClock('Europe/Bucharest', {
					...noon,
					year: 1985,
				}),
			).toEqual('+03:00');
		});

		it('should follow daylight saving transitions', () => {
			expect(
				service.getOffsetForWallClock('Europe/Bucharest', {
					year: 2026,
					month: 1,
					day: 15,
					hour: 12,
					minute: 0,
					second: 0,
				}),
			).toEqual('+02:00');

			expect(
				service.getOffsetForWallClock('Europe/Bucharest', {
					year: 2026,
					month: 7,
					day: 15,
					hour: 12,
					minute: 0,
					second: 0,
				}),
			).toEqual('+03:00');
		});

		it('should follow historical offset changes', () => {
			expect(
				service.getOffsetForWallClock('Asia/Kathmandu', {
					...noon,
					year: 1985,
				}),
			).toEqual('+05:30');

			expect(
				service.getOffsetForWallClock('Asia/Kathmandu', {
					year: 2026,
					month: 1,
					day: 15,
					hour: 12,
					minute: 0,
					second: 0,
				}),
			).toEqual('+05:45');
		});

		it('should handle half-hour and quarter-hour offsets', () => {
			expect(
				service.getOffsetForWallClock('Asia/Kolkata', { ...noon, year: 2026 }),
			).toEqual('+05:30');

			expect(
				service.getOffsetForWallClock('Australia/Eucla', {
					...noon,
					year: 2026,
				}),
			).toEqual('+08:45');
		});

		it('should handle negative offsets', () => {
			expect(
				service.getOffsetForWallClock('America/New_York', {
					year: 2026,
					month: 1,
					day: 15,
					hour: 12,
					minute: 0,
					second: 0,
				}),
			).toEqual('-05:00');
		});

		it('should report zero offsets as +00:00', () => {
			expect(
				service.getOffsetForWallClock('Africa/Accra', { ...noon, year: 1985 }),
			).toEqual('+00:00');

			expect(
				service.getOffsetForWallClock('UTC', { ...noon, year: 2026 }),
			).toEqual('+00:00');
		});

		it('should drop the seconds from pre-standard-time local mean offsets', () => {
			// Two-digit years must not be shifted into the 1900s, and Africa/Accra
			// reports GMT-00:16:08 that far back.
			expect(
				service.getOffsetForWallClock('Africa/Accra', { ...noon, year: 85 }),
			).toEqual('-00:16');
		});
	});

	describe('getFirstTimezoneIdForOffset', () => {
		const offsetLabelOf = (timezoneId: string): string =>
			service.getOption(timezoneId).offsetLabel;

		it('should return null for anything that is not an EDTF offset', () => {
			expect(service.getFirstTimezoneIdForOffset(undefined)).toBeNull();
			expect(service.getFirstTimezoneIdForOffset(null)).toBeNull();
			expect(service.getFirstTimezoneIdForOffset('')).toBeNull();
			expect(
				service.getFirstTimezoneIdForOffset('Europe/Bucharest'),
			).toBeNull();

			expect(service.getFirstTimezoneIdForOffset('GMT+02:00')).toBeNull();
			expect(service.getFirstTimezoneIdForOffset('+2:00')).toBeNull();
			expect(service.getFirstTimezoneIdForOffset('+0200')).toBeNull();
			expect(service.getFirstTimezoneIdForOffset(120)).toBeNull();
		});

		it('should return a zone sitting on the offset asked for', () => {
			for (const offset of ['+00:00', '+01:00', '+02:00', '+05:30', '-05:00']) {
				const timezoneId = service.getFirstTimezoneIdForOffset(offset);

				expect(timezoneId).toBeTruthy();
				expect(offsetLabelOf(timezoneId)).toEqual(`GMT${offset}`);
			}
		});

		it('should return the first identifier in the grouped list', () => {
			const timezoneId = service.getFirstTimezoneIdForOffset('+02:00');
			const firstMatch = service
				.getGroupedOptions()
				.flatMap((group) => group.options)
				.find((option) => option.offsetLabel === 'GMT+02:00');

			expect(timezoneId).toEqual(firstMatch.timezoneId);
		});

		it('should infer the same zone every time for the same offset', () => {
			expect(service.getFirstTimezoneIdForOffset('-05:00')).toEqual(
				service.getFirstTimezoneIdForOffset('-05:00'),
			);
		});

		it('should return null for an offset no zone sits on today', () => {
			expect(service.getFirstTimezoneIdForOffset('-12:00')).toBeNull();
			expect(service.getFirstTimezoneIdForOffset('+13:45')).toBeNull();
		});
	});

	describe('getBrowserTimezoneId', () => {
		it('should return a resolvable identifier', () => {
			const browserTimezoneId = service.getBrowserTimezoneId();

			expect(service.resolveTimezoneId(browserTimezoneId)).toEqual(
				browserTimezoneId,
			);
		});
	});
});
