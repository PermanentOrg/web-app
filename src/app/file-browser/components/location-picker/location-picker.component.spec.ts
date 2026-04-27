import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { EditService } from '@core/services/edit/edit.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { PrLocationPipe } from '@shared/pipes/pr-location.pipe';
import { LocationPickerComponent } from './location-picker.component';

const fakeGoogleMaps = {
	LatLng: class {
		constructor(public input: unknown) {}
	},
	places: {
		Autocomplete: class {
			setFields(): void {}
			addListener(): void {}
			getPlace(): unknown {
				return null;
			}
		},
	},
};

const buildAddressComponents = (
	overrides: Partial<
		Record<string, { long_name: string; short_name: string }>
	> = {},
): google.maps.GeocoderAddressComponent[] => {
	const defaults: Record<string, { long_name: string; short_name: string }> = {
		street_number: { long_name: '55', short_name: '55' },
		route: { long_name: 'Rue Plumet', short_name: 'Rue Plumet' },
		locality: { long_name: 'Paris', short_name: 'Paris' },
		postal_code: { long_name: '75007', short_name: '75007' },
		administrative_area_level_1: {
			long_name: 'Ile-de-France',
			short_name: 'IDF',
		},
		country: { long_name: 'France', short_name: 'FR' },
	};
	const merged = { ...defaults, ...overrides };
	return Object.entries(merged)
		.filter(([, value]) => value !== undefined)
		.map(([type, value]) => ({
			long_name: value.long_name,
			short_name: value.short_name,
			types: [type],
		})) as google.maps.GeocoderAddressComponent[];
};

const buildPlace = (
	overrides: Partial<google.maps.places.PlaceResult> = {},
	addressOverrides:
		| Parameters<typeof buildAddressComponents>[0]
		| undefined = undefined,
): google.maps.places.PlaceResult =>
	({
		name: "Jean Valjean's House",
		address_components: buildAddressComponents(addressOverrides),
		geometry: {
			location: {
				lat: () => 48.83,
				lng: () => 2.3,
			},
		},
		...overrides,
	}) as unknown as google.maps.places.PlaceResult;

describe('LocationPickerComponent', () => {
	let fixture: ComponentFixture<LocationPickerComponent>;
	let component: LocationPickerComponent;
	const testWindow = window as unknown as { google?: unknown };
	let previousGoogle: unknown;
	let hadGoogle = false;

	beforeAll(() => {
		hadGoogle = 'google' in testWindow;
		previousGoogle = testWindow.google;
		testWindow.google = { maps: fakeGoogleMaps };
	});

	afterAll(() => {
		if (hadGoogle) {
			testWindow.google = previousGoogle;
		} else {
			delete testWindow.google;
		}
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LocationPickerComponent],
			providers: [
				{ provide: ApiService, useValue: {} },
				{ provide: MessageService, useValue: {} },
				{ provide: EditService, useValue: {} },
				{ provide: ProfileService, useValue: {} },
				{ provide: PrLocationPipe, useValue: { transform: () => ({}) } },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(LocationPickerComponent);
		component = fixture.componentInstance;
	});

	describe('createLocnFromPlace', () => {
		it('populates the spec-aligned fields', () => {
			const locn = component.createLocnFromPlace(buildPlace());

			expect(locn.sublocation).toBe('55 Rue Plumet');
			expect(locn.city).toBe('Paris');
			expect(locn.adminOneName).toBe('Ile-de-France');
			expect(locn.country).toBe('France');
			expect(locn.postalCode).toBe('75007');
			expect(locn.latitude).toBe(48.83);
			expect(locn.longitude).toBe(2.3);
		});

		it('does not write deprecated legacy fields', () => {
			const locn = component.createLocnFromPlace(buildPlace());

			expect(locn.streetNumber).toBeUndefined();
			expect(locn.streetName).toBeUndefined();
			expect(locn.locality).toBeUndefined();
			expect(locn.countryCode).toBeUndefined();
			expect(locn.adminOneCode).toBeUndefined();
			expect(locn.adminTwoName).toBeUndefined();
			expect(locn.adminTwoCode).toBeUndefined();
		});

		it('sets sublocation to null when no street number or street name is available', () => {
			const locn = component.createLocnFromPlace(
				buildPlace({}, { street_number: undefined, route: undefined }),
			);

			expect(locn.sublocation).toBeNull();
		});

		it('falls back to streetName alone when streetNumber is absent', () => {
			const locn = component.createLocnFromPlace(
				buildPlace({}, { street_number: undefined }),
			);

			expect(locn.sublocation).toBe('Rue Plumet');
		});

		it('writes name when the place name does not include the sublocation', () => {
			const locn = component.createLocnFromPlace(buildPlace());

			expect(locn.name).toBe("Jean Valjean's House");
		});

		it('omits name when the place name already matches the sublocation', () => {
			const locn = component.createLocnFromPlace(
				buildPlace({ name: '55 Rue Plumet' }),
			);

			expect(locn.name).toBeUndefined();
		});
	});
});
