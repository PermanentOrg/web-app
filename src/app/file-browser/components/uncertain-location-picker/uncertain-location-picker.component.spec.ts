import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { RecordVO } from '@models';
import { UncertainLocationPickerComponent } from './uncertain-location-picker.component';

describe('UncertainLocationPickerComponent', () => {
	let fixture: ComponentFixture<UncertainLocationPickerComponent>;
	let component: UncertainLocationPickerComponent;
	let dialogRef: jasmine.SpyObj<DialogRef>;
	const item = new RecordVO({ recordId: 123 });

	beforeEach(async () => {
		dialogRef = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			declarations: [UncertainLocationPickerComponent],
			providers: [
				{ provide: DIALOG_DATA, useValue: { item } },
				{ provide: DialogRef, useValue: dialogRef },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(UncertainLocationPickerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should read the item off the dialog data', () => {
		expect(component.item).toBe(item);
	});

	it('should render a titled dialog', () => {
		const header = fixture.nativeElement.querySelector('.header span');

		expect(header.textContent.trim()).toBe('Edit location');
	});

	it('should close the dialog from the header close button', () => {
		const close = fixture.nativeElement.querySelector('.header button');
		close.click();

		expect(dialogRef.close).toHaveBeenCalled();
	});

	it('should close the dialog on cancel', () => {
		component.cancel();

		expect(dialogRef.close).toHaveBeenCalled();
	});
});
