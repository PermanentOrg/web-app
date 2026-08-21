import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { RecordVO } from '@models';
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

	describe('with an item that has no location', () => {
		const item = new RecordVO({ recordId: 123 });

		beforeEach(async () => {
			await setUp({ item });
		});

		it('should read the item off the dialog data', () => {
			expect(component.item).toBe(item);
		});

		it('should start the card at the top, with no room taken by the gradient', () => {
			const host: HTMLElement = fixture.nativeElement;
			const card: HTMLElement = host.querySelector(
				'.pr-uncertain-location-dialog',
			);
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

		it('should point the icons at the gradient the dialog defines', () => {
			const gradient = fixture.nativeElement.querySelector(
				`linearGradient#${component.iconGradientId}`,
			);

			expect(gradient).not.toBeNull();
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

		it('should close with the edited location on save', () => {
			component.setField('city', 'Paris');
			component.save();

			expect(dialogRef.close).toHaveBeenCalledOnceWith({ city: 'Paris' });
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
				jasmine.objectContaining({ locnId: 42, city: 'Lyon' }),
			);
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
