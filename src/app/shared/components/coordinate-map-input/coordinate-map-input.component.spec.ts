import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleMapsModule } from '@angular/google-maps';
import { Coordinates } from '@shared/utilities/coordinates';
import { CoordinateMapInputComponent } from './coordinate-map-input.component';

const LISBON: Coordinates = { latitude: 38.70786, longitude: -9.400139 };
const LISBON_AS_TEXT = `38°42'28.3" N  9°24'00.5" W`;

const mapClickAt = (lat: number, lng: number): google.maps.MapMouseEvent =>
	({
		latLng: { lat: () => lat, lng: () => lng },
	}) as google.maps.MapMouseEvent;

@Component({
	standalone: true,
	imports: [CoordinateMapInputComponent],
	template: `<pr-coordinate-map-input
		[coordinates]="coordinates"
		(coordinatesChange)="onCoordinatesChange($event)"
		(validityChange)="onValidityChange($event)"
	/>`,
})
class TestHostComponent {
	@ViewChild(CoordinateMapInputComponent) input: CoordinateMapInputComponent;
	coordinates: Coordinates | null = null;
	emitted: (Coordinates | null)[] = [];
	validity: boolean[] = [];

	onCoordinatesChange(coordinates: Coordinates | null): void {
		this.emitted.push(coordinates);
	}

	onValidityChange(isValid: boolean): void {
		this.validity.push(isValid);
	}
}

describe('CoordinateMapInputComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let host: TestHostComponent;

	const setUp = async (coordinates: Coordinates | null): Promise<void> => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		})
			.overrideComponent(CoordinateMapInputComponent, {
				remove: { imports: [GoogleMapsModule] },
				add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
			})
			.compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		host = fixture.componentInstance;
		host.coordinates = coordinates;
		fixture.detectChanges();
	};

	const getField = (): HTMLInputElement =>
		fixture.nativeElement.querySelector('.pr-icon-text-input-control');

	const typeInField = (value: string): void => {
		const field = getField();
		field.value = value;
		field.dispatchEvent(new Event('input'));
		fixture.detectChanges();
	};

	describe('with no coordinates', () => {
		beforeEach(async () => {
			await setUp(null);
		});

		it('should start with an empty field', () => {
			expect(getField().value).toBe('');
		});

		it('should show no pin', () => {
			expect(host.input.markerPosition()).toBeNull();
		});

		it('should open on the whole country', () => {
			expect(host.input.mapOptions.zoom).toBe(4);
		});
	});

	describe('with coordinates given', () => {
		beforeEach(async () => {
			await setUp(LISBON);
		});

		it('should write them into the field', () => {
			expect(getField().value).toBe(LISBON_AS_TEXT);
		});

		it('should drop the pin on them', () => {
			expect(host.input.markerPosition()).toEqual({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});
		});

		it('should centre the map on them', () => {
			expect(host.input.mapOptions.center).toEqual({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});

			expect(host.input.mapOptions.zoom).toBe(12);
		});

		it('should not report anything it was merely given', () => {
			expect(host.emitted).toEqual([]);
		});
	});

	describe('clicking the map', () => {
		beforeEach(async () => {
			await setUp(null);
		});

		it('should move the pin to the click', () => {
			host.input.onMapClick(mapClickAt(LISBON.latitude, LISBON.longitude));
			fixture.detectChanges();

			expect(host.input.markerPosition()).toEqual({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});
		});

		it('should write the clicked pair into the field', () => {
			host.input.onMapClick(mapClickAt(LISBON.latitude, LISBON.longitude));
			fixture.detectChanges();

			expect(getField().value).toBe(LISBON_AS_TEXT);
		});

		it('should report the clicked pair', () => {
			host.input.onMapClick(mapClickAt(LISBON.latitude, LISBON.longitude));

			expect(host.emitted).toEqual([LISBON]);
		});

		it('should ignore a click that names no position', () => {
			host.input.onMapClick({} as google.maps.MapMouseEvent);

			expect(host.input.markerPosition()).toBeNull();
			expect(host.emitted).toEqual([]);
		});
	});

	describe('when the coordinates it was given change', () => {
		beforeEach(async () => {
			await setUp(LISBON);
		});

		it('should follow them to a new place', () => {
			const sydney = { latitude: -33.8688, longitude: 151.2093 };
			host.coordinates = sydney;
			fixture.detectChanges();

			expect(host.input.markerPosition()).toEqual({
				lat: sydney.latitude,
				lng: sydney.longitude,
			});
		});

		it('should keep the opening view rather than re-centring on every change', () => {
			host.coordinates = { latitude: -33.8688, longitude: 151.2093 };
			fixture.detectChanges();

			expect(host.input.mapOptions.center).toEqual({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});
		});

		it('should empty the field when they are taken away', () => {
			host.coordinates = null;
			fixture.detectChanges();

			expect(getField().value).toBe('');
		});
	});

	describe('typing into the field', () => {
		let panTo: jasmine.Spy;

		beforeEach(async () => {
			await setUp(null);
			panTo = jasmine.createSpy('panTo');
			host.input.map = {
				panTo,
				googleMap: {},
			} as unknown as typeof host.input.map;
		});

		it('should report a pair typed in full', () => {
			typeInField('38.70786, -9.400139');

			expect(host.emitted).toEqual([LISBON]);
		});

		it('should follow the pin with the map', () => {
			typeInField('38.70786, -9.400139');

			expect(panTo).toHaveBeenCalledWith({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});
		});

		it('should leave the typed text as typed', () => {
			typeInField('38.70786, -9.400139');

			expect(getField().value).toBe('38.70786, -9.400139');
		});

		it('should leave the map alone until the Maps API has loaded', () => {
			host.input.map = { panTo } as unknown as typeof host.input.map;

			typeInField('38.70786, -9.400139');

			expect(panTo).not.toHaveBeenCalled();
		});

		it('should hold the pin still while the pair is half typed', () => {
			typeInField('38.70786, -9.400139');
			typeInField('38.70786, -');

			expect(host.input.markerPosition()).toEqual({
				lat: LISBON.latitude,
				lng: LISBON.longitude,
			});
		});

		it('should report itself invalid while the text names no pair', () => {
			typeInField('38.70786, -');

			expect(host.input.isValid()).toBeFalse();
			expect(host.validity.pop()).toBeFalse();
		});

		it('should mark the field invalid to the eye as well', () => {
			typeInField('38.70786, -');

			expect(
				fixture.nativeElement.querySelector('.pr-icon-text-input.invalid'),
			).not.toBeNull();
		});

		it('should drop the pin when the field is emptied', () => {
			typeInField('38.70786, -9.400139');
			typeInField('   ');

			expect(host.input.markerPosition()).toBeNull();
			expect(host.emitted.pop()).toBeNull();
		});

		it('should call an emptied field valid, since that clears the pair', () => {
			typeInField('   ');

			expect(host.input.isValid()).toBeTrue();
		});

		it('should become valid again once the text reads as a pair', () => {
			typeInField('40.7, -74.');
			typeInField('40.7, -74.0');

			expect(host.input.isValid()).toBeTrue();
		});
	});
});
