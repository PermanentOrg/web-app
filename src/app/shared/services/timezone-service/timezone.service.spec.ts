import { TimezoneService } from './timezone.service';

describe('TimezoneService', () => {
	let service: TimezoneService;

	// A summer date in the northern hemisphere — useful for triggering DST in
	// New York (EDT, -04:00) and the absence of DST in Asia/Kolkata (+05:30).
	const summerDate = new Date(Date.UTC(2025, 6, 15, 12, 0, 0));
	const winterDate = new Date(Date.UTC(2025, 0, 15, 12, 0, 0));

	beforeEach(() => {
		service = new TimezoneService();
	});

	describe('getIanaZones', () => {
		it('should return a non-empty list of IANA zones', () => {
			const zones = service.getIanaZones();

			expect(zones.length).toBeGreaterThan(100);
		});

		it('should include common IANA zones', () => {
			const zones = service.getIanaZones();

			// Limit to zones that all engines return canonically.
			expect(zones).toContain('America/New_York');
			expect(zones).toContain('Europe/Berlin');
		});

		it('should memoise the list across calls', () => {
			const firstCall = service.getIanaZones();
			const secondCall = service.getIanaZones();

			expect(firstCall).toBe(secondCall);
		});
	});

	describe('computeOffsetForZone', () => {
		it('should return GMT+00:00 for UTC', () => {
			expect(service.computeOffsetForZone('UTC', summerDate)).toBe('GMT+00:00');
		});

		it('should return DST-adjusted offset for New York in summer', () => {
			expect(service.computeOffsetForZone('America/New_York', summerDate)).toBe(
				'GMT-04:00',
			);
		});

		it('should return standard offset for New York in winter', () => {
			expect(service.computeOffsetForZone('America/New_York', winterDate)).toBe(
				'GMT-05:00',
			);
		});

		it('should return half-hour offset for Asia/Kolkata', () => {
			expect(service.computeOffsetForZone('Asia/Kolkata', summerDate)).toBe(
				'GMT+05:30',
			);
		});

		it('should return empty string for invalid zone', () => {
			expect(service.computeOffsetForZone('Not/A_Zone', summerDate)).toBe('');
		});

		it('should return empty string for empty zone', () => {
			expect(service.computeOffsetForZone('', summerDate)).toBe('');
		});
	});

	describe('getAbbreviationForZone', () => {
		it('should return EDT for New York in summer', () => {
			expect(
				service.getAbbreviationForZone('America/New_York', summerDate),
			).toBe('EDT');
		});

		it('should return EST for New York in winter', () => {
			expect(
				service.getAbbreviationForZone('America/New_York', winterDate),
			).toBe('EST');
		});

		it('should return empty string when the abbreviation lookup fails', () => {
			expect(service.getAbbreviationForZone('Not/A_Zone', summerDate)).toBe('');
		});
	});

	describe('findZoneByOffset', () => {
		it('should find a zone matching GMT-04:00 in summer', () => {
			const zone = service.findZoneByOffset('GMT-04:00', summerDate);

			expect(zone).toBeTruthy();
			expect(service.computeOffsetForZone(zone as string, summerDate)).toBe(
				'GMT-04:00',
			);
		});

		it('should accept bare offset notation', () => {
			const zone = service.findZoneByOffset('-05:00', winterDate);

			expect(zone).toBeTruthy();
			expect(service.computeOffsetForZone(zone as string, winterDate)).toBe(
				'GMT-05:00',
			);
		});

		it('should map Z to GMT+00:00', () => {
			const zone = service.findZoneByOffset('Z', summerDate);

			expect(zone).toBeTruthy();
			expect(service.computeOffsetForZone(zone as string, summerDate)).toBe(
				'GMT+00:00',
			);
		});

		it('should return null for empty offset', () => {
			expect(service.findZoneByOffset('', summerDate)).toBeNull();
		});

		it('should return null when no zone matches', () => {
			expect(service.findZoneByOffset('GMT+99:00', summerDate)).toBeNull();
		});

		it('should prefer the local zone when its offset matches', () => {
			const localZone = service.getLocalZone();
			const localOffset = service.computeOffsetForZone(localZone, summerDate);
			const result = service.findZoneByOffset(localOffset, summerDate);

			expect(result).toBe(localZone);
		});
	});

	describe('getLocalZone', () => {
		it('should return a non-empty IANA zone', () => {
			const zone = service.getLocalZone();

			expect(zone).toBeTruthy();
			expect(zone).toContain('/');
		});
	});

	describe('formatZoneLabel', () => {
		it('should replace underscores with spaces', () => {
			expect(service.formatZoneLabel('America/New_York')).toBe(
				'America / New York',
			);
		});

		it('should replace slashes with " / "', () => {
			expect(service.formatZoneLabel('Europe/Berlin')).toBe('Europe / Berlin');
		});

		it('should handle multi-segment zones', () => {
			expect(service.formatZoneLabel('America/Argentina/Buenos_Aires')).toBe(
				'America / Argentina / Buenos Aires',
			);
		});
	});

	describe('getZones', () => {
		it('should return entries with all four fields populated', () => {
			const zones = service.getZones(summerDate);
			const newYork = zones.find((z) => z.ianaZone === 'America/New_York');

			expect(newYork).toBeTruthy();
			expect(newYork?.offset).toBe('GMT-04:00');
			expect(newYork?.label).toBe('America / New York');
			expect(newYork?.abbreviation).toBe('EDT');
		});
	});
});
