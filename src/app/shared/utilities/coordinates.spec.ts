import {
	coordinatesFromLocation,
	formatCoordinates,
	parseCoordinates,
} from './coordinates';

describe('formatCoordinates', () => {
	it('writes the pair as degrees, minutes and seconds', () => {
		expect(
			formatCoordinates({ latitude: 38.70786, longitude: -9.400139 }),
		).toBe(`38°42'28.3" N  9°24'00.5" W`);
	});

	it('names the southern and eastern hemispheres', () => {
		expect(formatCoordinates({ latitude: -33.8688, longitude: 151.2093 })).toBe(
			`33°52'07.7" S  151°12'33.5" E`,
		);
	});

	it('treats the equator and prime meridian as north and east', () => {
		expect(formatCoordinates({ latitude: 0, longitude: 0 })).toBe(
			`0°00'00.0" N  0°00'00.0" E`,
		);
	});

	it('carries a rounded-up second into the minute above it', () => {
		// 0.99999° is 59'59.996", which must not print as 59'60.0".
		expect(formatCoordinates({ latitude: 0.99999, longitude: 0 })).toBe(
			`1°00'00.0" N  0°00'00.0" E`,
		);
	});
});

describe('parseCoordinates', () => {
	it('reads back what formatCoordinates wrote', () => {
		const parsed = parseCoordinates(`38°42'28.3" N  9°24'00.5" W`);

		expect(parsed.latitude).toBeCloseTo(38.707861, 6);
		expect(parsed.longitude).toBeCloseTo(-9.400139, 6);
	});

	it('reads decimal degrees separated by a comma', () => {
		expect(parseCoordinates('38.7078, -9.4001')).toEqual({
			latitude: 38.7078,
			longitude: -9.4001,
		});
	});

	it('reads decimal degrees separated by whitespace alone', () => {
		expect(parseCoordinates('38.7078 -9.4001')).toEqual({
			latitude: 38.7078,
			longitude: -9.4001,
		});
	});

	it('reads decimal degrees carrying hemisphere letters', () => {
		expect(parseCoordinates('38.7078° N; 9.4001° W')).toEqual({
			latitude: 38.7078,
			longitude: -9.4001,
		});
	});

	it('accepts lowercase hemisphere letters', () => {
		expect(parseCoordinates('38.7078 n, 9.4001 w')).toEqual({
			latitude: 38.7078,
			longitude: -9.4001,
		});
	});

	it('reads degrees and minutes without seconds', () => {
		expect(parseCoordinates(`38°42' N  9°24' W`)).toEqual({
			latitude: 38.7,
			longitude: -9.4,
		});
	});

	it('lets the hemisphere letters name the axis when longitude comes first', () => {
		expect(parseCoordinates('9.4001° W, 38.7078° N')).toEqual({
			latitude: 38.7078,
			longitude: -9.4001,
		});
	});

	it('assumes latitude first when no letters name the axis', () => {
		expect(parseCoordinates('9.4001, 38.7078')).toEqual({
			latitude: 9.4001,
			longitude: 38.7078,
		});
	});

	it('rejects two angles from the same axis', () => {
		expect(parseCoordinates('38° N, 9° N')).toBeNull();
	});

	it('rejects a sign that contradicts its hemisphere letter', () => {
		expect(parseCoordinates('-38 N, -9 W')).toBeNull();
		expect(parseCoordinates('-38 S, 9 E')).toBeNull();
	});

	it('still accepts a sign on the half that carries no letter', () => {
		expect(parseCoordinates('-38, 9 E')).toEqual({
			latitude: -38,
			longitude: 9,
		});
	});

	it('rejects a latitude beyond the poles', () => {
		expect(parseCoordinates('91, 9')).toBeNull();
	});

	it('rejects a longitude beyond half a turn', () => {
		expect(parseCoordinates('38, 181')).toBeNull();
	});

	it('rejects minutes and seconds that overflow', () => {
		expect(parseCoordinates(`38°60'00.0" N  9°00'00.0" W`)).toBeNull();
		expect(parseCoordinates(`38°00'60.0" N  9°00'00.0" W`)).toBeNull();
	});

	it('rejects a half-typed pair rather than guessing at the rest', () => {
		expect(parseCoordinates('38.70, ')).toBeNull();
		expect(parseCoordinates('')).toBeNull();
		expect(parseCoordinates(null)).toBeNull();
	});

	it('rejects a lone number, decimal point and all', () => {
		expect(parseCoordinates('38')).toBeNull();
		// Without a separator this reads as 38.7 and 0.
		expect(parseCoordinates('38.70')).toBeNull();
	});

	it('rejects text that is not a coordinate pair at all', () => {
		expect(parseCoordinates('Lisbon, Portugal')).toBeNull();
	});
});

describe('coordinatesFromLocation', () => {
	it('reads a stored pair', () => {
		expect(
			coordinatesFromLocation({ latitude: 38.7078, longitude: -9.4001 }),
		).toEqual({ latitude: 38.7078, longitude: -9.4001 });
	});

	it('reads a pair that was stored as strings', () => {
		expect(
			coordinatesFromLocation({ latitude: '38.7078', longitude: '-9.4001' }),
		).toEqual({ latitude: 38.7078, longitude: -9.4001 });
	});

	it('returns null when the location carries no pair', () => {
		expect(coordinatesFromLocation({ city: 'Lisbon' })).toBeNull();
		expect(coordinatesFromLocation({ latitude: 38.7078 })).toBeNull();
		expect(coordinatesFromLocation({ latitude: '', longitude: '' })).toBeNull();
		expect(coordinatesFromLocation(null)).toBeNull();
	});

	it('returns null when what was stored is not a number', () => {
		expect(
			coordinatesFromLocation({ latitude: 'somewhere', longitude: 'nice' }),
		).toBeNull();
	});
});
