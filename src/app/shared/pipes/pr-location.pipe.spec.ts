import { LocnVOData } from '@models';
import { PrLocationPipe } from './pr-location.pipe';

describe('PrLocationPipe', () => {
	let pipe: PrLocationPipe;

	beforeEach(() => {
		pipe = new PrLocationPipe();
	});

	it('returns null when input is null', () => {
		expect(pipe.transform(null)).toBeNull();
	});

	it('renders the spec-aligned fields', () => {
		const locn: LocnVOData = {
			sublocation: '55 Rue Plumet',
			city: 'Paris',
			name: "Jean Valjean's House",
			adminOneName: 'Ile-de-France',
			country: 'France',
			latitude: 48.83,
			longitude: 2.3,
		};

		const output = pipe.transform(locn);

		expect(output.line1).toBe('55 Rue Plumet');
		expect(output.line2).toContain('Paris');
		expect(output.name).toBe("Jean Valjean's House");
		expect(output.full.startsWith("Jean Valjean's House, ")).toBe(true);
	});

	it('renders the name even when it matches line1', () => {
		const locn: LocnVOData = {
			sublocation: '55 Rue Plumet',
			name: '55 Rue Plumet',
			city: 'Paris',
			country: 'France',
			latitude: 48.83,
			longitude: 2.3,
		};

		const output = pipe.transform(locn);

		expect(output.name).toBe('55 Rue Plumet');
	});

	it('falls through to lat/long when address fields are missing', () => {
		const locn: LocnVOData = {
			latitude: 48.83,
			longitude: 2.3,
			country: 'France',
		};

		const output = pipe.transform(locn);

		expect(output.line1).toBe('48.83, 2.3');
		expect(output.line2).toContain('France');
	});

	it('reports unknown when no address or coordinates fall through to line2', () => {
		const locn: LocnVOData = {
			sublocation: '55 Rue Plumet',
		};

		const output = pipe.transform(locn);

		expect(output.line2).toBe('Unknown Location');
	});
});
