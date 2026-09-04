import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { GoogleMapsModule } from '@angular/google-maps';
import { RecordVO } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { CoordinateMapInputComponent } from '@shared/components/coordinate-map-input/coordinate-map-input.component';
import {
	CoordinatePickerComponent,
	CoordinatePickerData,
} from './coordinate-picker.component';

const LISBON = { latitude: 38.70786, longitude: -9.400139 };

describe('CoordinatePickerComponent', () => {
	let fixture: ComponentFixture<CoordinatePickerComponent>;
	let component: CoordinatePickerComponent;
	let dialogRef: jasmine.SpyObj<DialogRef>;

	const setUp = async (dialogData: CoordinatePickerData): Promise<void> => {
		dialogRef = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [CoordinatePickerComponent],
			providers: [
				{ provide: DIALOG_DATA, useValue: dialogData },
				{ provide: DialogRef, useValue: dialogRef },
			],
		})
			.overrideComponent(CoordinateMapInputComponent, {
				remove: { imports: [GoogleMapsModule] },
				add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
			})
			.compileComponents();

		fixture = TestBed.createComponent(CoordinatePickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

	describe('with an item that has no location', () => {
		const item = new RecordVO({ recordId: 123 });

		beforeEach(async () => {
			await setUp({ item });
		});

		it('should read the item off the dialog data', () => {
			expect(component.item).toBe(item);
		});

		it('should render a titled dialog', () => {
			expect(query('.pr-dialog-header h2').textContent.trim()).toBe(
				'Choose GPS Coordinates',
			);
		});

		it('should hand the map input nothing to start from', () => {
			expect(component.coordinates()).toBeNull();
		});
	});

	describe('when the item already has coordinates', () => {
		beforeEach(async () => {
			await setUp({
				item: new RecordVO({
					recordId: 123,
					LocnVO: { ...LISBON, city: 'Lisbon' },
				}),
			});
		});

		it('should hand the stored pair to the map input', () => {
			expect(component.coordinates()).toEqual(LISBON);
		});

		it('should keep the address it was given when saving', () => {
			component.save();

			expect(dialogRef.close).toHaveBeenCalledWith({
				location: { ...LISBON, city: 'Lisbon' },
			});
		});

		it('should clear the stored pair when the map input reports none', () => {
			component.onCoordinatesChange(null);
			component.save();

			expect(dialogRef.close).toHaveBeenCalledWith({
				location: { latitude: null, longitude: null, city: 'Lisbon' },
			});
		});
	});

	describe('when the item has an address but no coordinates', () => {
		beforeEach(async () => {
			await setUp({
				item: new RecordVO({ recordId: 123, LocnVO: { city: 'Lisbon' } }),
			});
		});

		it('should still carry the address through a save', () => {
			component.save();

			expect(dialogRef.close).toHaveBeenCalledWith({
				location: { city: 'Lisbon', latitude: null, longitude: null },
			});
		});
	});

	describe('when a profile item carries the location', () => {
		it('should read the first of its locations', async () => {
			await setUp({
				profileItem: { LocnVOs: [{ ...LISBON }] } as ProfileItemVOData,
			});

			expect(component.coordinates()).toEqual(LISBON);
		});
	});

	describe('when the map input reports unreadable text', () => {
		beforeEach(async () => {
			await setUp({
				item: new RecordVO({ recordId: 123, LocnVO: { ...LISBON } }),
			});
		});

		it('should disable the confirm button', () => {
			component.onValidityChange(false);
			fixture.detectChanges();

			expect(query<HTMLButtonElement>('.pr-btn-confirm').disabled).toBeTrue();
		});

		it('should refuse to save the pair the field is no longer showing', () => {
			component.onValidityChange(false);
			component.save();

			expect(dialogRef.close).not.toHaveBeenCalled();
		});
	});

	describe('leaving the dialog', () => {
		beforeEach(async () => {
			await setUp({ item: new RecordVO({ recordId: 123 }) });
		});

		it('should close with nothing when cancelled', () => {
			query<HTMLButtonElement>('.pr-btn-cancel').click();

			expect(dialogRef.close).toHaveBeenCalledWith();
		});

		it('should close with nothing when dismissed from the header', () => {
			query<HTMLButtonElement>('.pr-close-button').click();

			expect(dialogRef.close).toHaveBeenCalledWith();
		});

		it('should close with the pair when saved', () => {
			component.onCoordinatesChange(LISBON);
			query<HTMLButtonElement>('.pr-btn-confirm').click();

			expect(dialogRef.close).toHaveBeenCalledWith({ location: LISBON });
		});
	});
});
