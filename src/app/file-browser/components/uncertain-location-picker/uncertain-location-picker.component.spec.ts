import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { LocationQualifier, RecordVO } from '@models';
import { ProfileItemVOData } from '@models/profile-item-vo';
import {
	LOCATION_FIELDS,
	UncertainLocationPickerComponent,
	UncertainLocationPickerData,
} from './uncertain-location-picker.component';

describe('UncertainLocationPickerComponent', () => {
	let fixture: ComponentFixture<UncertainLocationPickerComponent>;
	let component: UncertainLocationPickerComponent;
	let dialogRef: jasmine.SpyObj<DialogRef>;

	const setUp = async (
		dialogData: UncertainLocationPickerData,
	): Promise<void> => {
		dialogRef = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [UncertainLocationPickerComponent],
			providers: [
				{ provide: DIALOG_DATA, useValue: dialogData },
				{ provide: DialogRef, useValue: dialogRef },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(UncertainLocationPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	};

	const getFields = (): HTMLInputElement[] =>
		Array.from(
			fixture.nativeElement.querySelectorAll('.pr-icon-text-input-control'),
		);

	const getFieldByLabel = (label: string): HTMLInputElement =>
		getFields().find((input) => input.getAttribute('aria-label') === label);

	const getToggle = (label: string): HTMLInputElement => {
		const options: HTMLElement[] = Array.from(
			fixture.nativeElement.querySelectorAll('.pr-qualifier-option'),
		);
		const option = options.find(
			(candidate) =>
				candidate
					.querySelector('.pr-qualifier-option-label')
					.textContent.trim() === label,
		);
		return option?.querySelector('input');
	};

	describe('with an item that has no location', () => {
		const item = new RecordVO({ recordId: 123 });

		beforeEach(async () => {
			await setUp({ item });
		});

		it('should read the item off the dialog data', () => {
			expect(component.item).toBe(item);
		});

		it('should start the card at the top of the host', () => {
			const host: HTMLElement = fixture.nativeElement;
			const card: HTMLElement = host.querySelector('.pr-dialog-frame');
			const gap =
				card.getBoundingClientRect().top - host.getBoundingClientRect().top;

			expect(gap).toBe(0);
		});

		it('should render a titled dialog', () => {
			const header = fixture.nativeElement.querySelector(
				'.pr-dialog-header h2',
			);

			expect(header.textContent.trim()).toBe('Add a place or address…');
		});

		it('should render a name field and one field per address part', () => {
			expect(getFields().length).toBe(LOCATION_FIELDS.length + 1);
			expect(getFieldByLabel('Name this place')).toBeTruthy();

			LOCATION_FIELDS.forEach((field) => {
				expect(getFieldByLabel(field.label)).toBeTruthy();
			});
		});

		it('should render the location icons the design calls for', () => {
			const icons: string[] = Array.from(
				fixture.nativeElement.querySelectorAll(
					'.pr-icon-text-input-icon svg[data-icon]',
				),
			).map((svg: SVGElement) => svg.getAttribute('data-icon'));

			expect(icons).toEqual([
				'house',
				'signs-post',
				'house-building',
				'mountain-sun',
				'input-numeric',
				'flag-usa',
			]);
		});

		it('should start with empty fields', () => {
			getFields().forEach((input) => {
				expect(input.value).toBe('');
			});
		});

		it('should collect what was typed into each field', () => {
			component.setField('name', "Jean Valjean's House");
			component.setField('sublocation', '55 Rue Plumet');
			component.setField('city', 'Paris');
			component.setField('adminOneName', 'Ile-de-France');
			component.setField('postalCode', '75007');
			component.setField('country', 'France');

			expect(component.location()).toEqual({
				name: "Jean Valjean's House",
				sublocation: '55 Rue Plumet',
				city: 'Paris',
				adminOneName: 'Ile-de-France',
				postalCode: '75007',
				country: 'France',
			});
		});

		it('should let any filled field clear itself, not just the name', () => {
			component.setField('city', 'Paris');
			fixture.detectChanges();

			const city = getFieldByLabel('City/Town/Village');
			const clear = city
				.closest('.pr-icon-text-input')
				.querySelector('.pr-icon-text-input-clear');

			expect(clear).not.toBeNull();
			expect(clear.getAttribute('aria-label')).toBe('Clear City/Town/Village');

			city.focus();

			expect(getComputedStyle(clear).display).toBe('flex');

			(clear as HTMLButtonElement).click();
			fixture.detectChanges();

			expect(component.location().city).toBe('');
		});

		it('should show a typed value in its field', () => {
			component.setField('city', 'Paris');
			fixture.detectChanges();

			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
		});

		it('should close with the edited location and qualifiers on save', () => {
			component.setField('city', 'Paris');
			component.onQualifierChange(LocationQualifier.Approximate);
			component.save();

			expect(dialogRef.close).toHaveBeenCalledOnceWith({
				location: { city: 'Paris' },
				qualifiers: { approximate: true, uncertain: false, unknown: false },
			});
		});

		it('should close with nothing on cancel', () => {
			component.cancel();

			expect(dialogRef.close).toHaveBeenCalledOnceWith();
		});

		it('should close the dialog from the header close button', () => {
			fixture.nativeElement.querySelector('.pr-close-button').click();

			expect(dialogRef.close).toHaveBeenCalledOnceWith();
		});
	});

	describe('with an item that already has a location', () => {
		beforeEach(async () => {
			await setUp({
				item: new RecordVO({
					recordId: 123,
					LocnVO: {
						locnId: 42,
						name: "Jean Valjean's House",
						sublocation: '55 Rue Plumet',
						city: 'Paris',
						adminOneName: 'Ile-de-France',
						postalCode: '75007',
						country: 'France',
					},
				}),
			});
		});

		it('should prefill the fields from the stored location', () => {
			expect(getFieldByLabel('Name this place').value).toBe(
				"Jean Valjean's House",
			);

			expect(getFieldByLabel('Postal/Delivery Address').value).toBe(
				'55 Rue Plumet',
			);

			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
			expect(getFieldByLabel('State/Province/District').value).toBe(
				'Ile-de-France',
			);

			expect(getFieldByLabel('Postal Code').value).toBe('75007');
			expect(getFieldByLabel('Country').value).toBe('France');
		});

		it('should keep fields it does not edit, so the saved location is not lopped off', () => {
			component.setField('city', 'Lyon');
			component.save();

			expect(dialogRef.close).toHaveBeenCalledOnceWith(
				jasmine.objectContaining({
					location: jasmine.objectContaining({ locnId: 42, city: 'Lyon' }),
				}),
			);
		});
	});

	describe('qualifiers', () => {
		beforeEach(async () => {
			await setUp({ item: new RecordVO({ recordId: 123 }) });
		});

		it('should name each toggle by the text beside it', () => {
			['Approximate', 'Uncertain', 'Unknown'].forEach((label) => {
				const option = getToggle(label).closest('label');

				expect(option).not.toBeNull();
				expect(option.textContent.trim()).toBe(label);
			});
		});

		it('should render a toggle per qualifier, all off', () => {
			['Approximate', 'Uncertain', 'Unknown'].forEach((label) => {
				expect(getToggle(label).checked).toBeFalse();
			});
		});

		it('should let approximate and uncertain apply at once', () => {
			component.onQualifierChange(LocationQualifier.Approximate);
			component.onQualifierChange(LocationQualifier.Uncertain);

			expect(component.qualifiers()).toEqual({
				approximate: true,
				uncertain: true,
				unknown: false,
			});
		});

		it('should toggle a qualifier back off', () => {
			component.onQualifierChange(LocationQualifier.Approximate);
			component.onQualifierChange(LocationQualifier.Approximate);

			expect(component.qualifiers().approximate).toBeFalse();
		});

		it('should toggle when the text beside the switch is clicked', () => {
			const label: HTMLElement = getToggle('Approximate')
				.closest('label')
				.querySelector('.pr-qualifier-option-label');
			label.click();
			fixture.detectChanges();

			expect(component.qualifiers().approximate).toBeTrue();
		});

		it('should toggle from the checkbox', () => {
			getToggle('Approximate').click();
			fixture.detectChanges();

			expect(component.qualifiers().approximate).toBeTrue();
			expect(getToggle('Approximate').checked).toBeTrue();
		});

		it('should put the other qualifiers away when unknown comes on', () => {
			component.onQualifierChange(LocationQualifier.Approximate);
			component.onQualifierChange(LocationQualifier.Uncertain);
			component.onQualifierChange(LocationQualifier.Unknown);

			expect(component.qualifiers()).toEqual({
				approximate: false,
				uncertain: false,
				unknown: true,
			});
		});

		it('should grey the fields out when unknown comes on, keeping what was typed', () => {
			component.setField('name', 'My old house');
			component.setField('city', 'Paris');

			component.onQualifierChange(LocationQualifier.Unknown);
			fixture.detectChanges();

			expect(component.fieldsDisabled()).toBeTrue();
			expect(getFieldByLabel('Name this place').value).toBe('My old house');
			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
			getFields().forEach((input) => {
				expect(input.disabled).toBeTrue();
			});
		});

		it('should offer no clear button on a greyed-out field', () => {
			component.setField('city', 'Paris');
			component.onQualifierChange(LocationQualifier.Unknown);
			fixture.detectChanges();

			const clear = getFieldByLabel('City/Town/Village')
				.closest('.pr-icon-text-input')
				.querySelector('.pr-icon-text-input-clear');

			expect(getComputedStyle(clear).display).toBe('none');
		});

		it('should leave only unknown togglable while unknown is on', () => {
			component.onQualifierChange(LocationQualifier.Unknown);
			fixture.detectChanges();

			expect(getToggle('Approximate').disabled).toBeTrue();
			expect(getToggle('Uncertain').disabled).toBeTrue();
			expect(getToggle('Unknown').disabled).toBeFalse();
		});

		it('should hand back the other qualifiers when unknown goes off again', () => {
			component.setField('city', 'Paris');
			component.onQualifierChange(LocationQualifier.Approximate);

			component.onQualifierChange(LocationQualifier.Unknown);
			component.onQualifierChange(LocationQualifier.Unknown);
			fixture.detectChanges();

			expect(component.fieldsDisabled()).toBeFalse();
			expect(component.qualifiers().approximate).toBeTrue();
			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
		});

		it('should save an unknown place with what was typed still on it', () => {
			component.setField('city', 'Paris');
			component.onQualifierChange(LocationQualifier.Unknown);
			component.save();

			expect(dialogRef.close).toHaveBeenCalledOnceWith({
				location: jasmine.objectContaining({ city: 'Paris' }),
				qualifiers: { approximate: false, uncertain: false, unknown: true },
			});
		});
	});

	describe('qualifiers of a stored location', () => {
		const openWithPrecision = async (precision: string): Promise<void> => {
			await setUp({
				item: new RecordVO({
					recordId: 123,
					LocnVO: { city: 'Paris', locationPrecision: precision },
				}),
			});
		};

		it('should read an approximate place', async () => {
			await openWithPrecision('approximate');

			expect(component.qualifiers()).toEqual({
				approximate: true,
				uncertain: false,
				unknown: false,
			});
		});

		it('should read an unknown place', async () => {
			await openWithPrecision('unknown');

			expect(component.qualifiers().unknown).toBeTrue();
			expect(component.fieldsDisabled()).toBeTrue();
		});

		it('should open an unknown place showing its address, greyed out', async () => {
			await openWithPrecision('unknown');

			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
			expect(getFieldByLabel('City/Town/Village').disabled).toBeTrue();
		});

		it('should not carry the stored precision back out', async () => {
			await openWithPrecision('approximate');

			component.onQualifierChange(LocationQualifier.Approximate);
			component.save();

			const [result] = dialogRef.close.calls.mostRecent().args as [
				{ location: Record<string, unknown> },
			];

			expect(result.location.locationPrecision).toBeUndefined();
			expect(component.qualifiers().approximate).toBeFalse();
		});

		it('should read a place that is both approximate and uncertain', async () => {
			await openWithPrecision('approximate-uncertain-known');

			expect(component.qualifiers()).toEqual({
				approximate: true,
				uncertain: true,
				unknown: false,
			});
		});

		it('should read a place with no recorded precision as exactly known', async () => {
			await setUp({
				item: new RecordVO({ recordId: 123, LocnVO: { city: 'Paris' } }),
			});

			expect(component.qualifiers()).toEqual({
				approximate: false,
				uncertain: false,
				unknown: false,
			});
		});
	});

	describe('clearing everything', () => {
		beforeEach(async () => {
			await setUp({
				item: new RecordVO({
					recordId: 123,
					LocnVO: {
						locnId: 42,
						name: 'My old house',
						city: 'Paris',
						latitude: 48.85,
						longitude: 2.35,
						countryCode: 'FR',
					},
				}),
			});
		});

		it('should empty every field and reset the qualifiers', () => {
			component.onQualifierChange(LocationQualifier.Approximate);

			fixture.nativeElement.querySelector('.pr-clear-link').click();
			fixture.detectChanges();

			expect(getFieldByLabel('Name this place').value).toBe('');
			expect(getFieldByLabel('City/Town/Village').value).toBe('');
			expect(component.qualifiers()).toEqual({
				approximate: false,
				uncertain: false,
				unknown: false,
			});
		});

		it('should drop the columns an address would be shimmed back out of', () => {
			component.clearAll();

			expect(component.location().countryCode).toBeUndefined();
			expect(component.location().locality).toBeUndefined();
		});

		it('should leave the coordinates alone, being a separate thing', () => {
			component.clearAll();

			expect(component.location().latitude).toBe(48.85);
			expect(component.location().longitude).toBe(2.35);
		});

		it('should keep fields it does not show, so clearing is not a delete', () => {
			component.clearAll();
			component.save();

			expect(dialogRef.close).toHaveBeenCalledOnceWith(
				jasmine.objectContaining({
					location: jasmine.objectContaining({ locnId: 42, city: '' }),
				}),
			);
		});

		it('should not bring cleared fields back by toggling unknown', () => {
			component.clearAll();
			component.onQualifierChange(LocationQualifier.Unknown);
			component.onQualifierChange(LocationQualifier.Unknown);
			fixture.detectChanges();

			expect(getFieldByLabel('City/Town/Village').value).toBe('');
		});
	});

	describe('with a profile item that already has a location', () => {
		beforeEach(async () => {
			const profileItem: ProfileItemVOData = {
				LocnVOs: [{ city: 'Paris' }],
			};
			await setUp({ profileItem });
		});

		it('should prefill from the first of the profile item locations', () => {
			expect(getFieldByLabel('City/Town/Village').value).toBe('Paris');
		});
	});
});
