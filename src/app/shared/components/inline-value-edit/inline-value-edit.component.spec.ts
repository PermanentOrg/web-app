import {
	ComponentFixture,
	TestBed,
	tick,
	fakeAsync,
} from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {
	NgbDatepickerModule,
	NgbTimepickerModule,
	NgbDate,
	NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';

import moment from 'moment';
import { RecordVO, RecordVOData } from '@models';
import {
	getOffsetMomentFromDTString,
	formatDateISOString,
	getUtcMomentFromDTString,
	momentFormatNum,
	applyTimezoneOffset,
} from '@shared/utilities/dateTime';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InlineValueEditComponent } from './inline-value-edit.component';

describe('InlineValueEditComponent', () => {
	let component: InlineValueEditComponent;
	let fixture: ComponentFixture<InlineValueEditComponent>;

	const TEST_TEXT = 'Test Name';

	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [InlineValueEditComponent],
			imports: [
				FormsModule,
				NgbDatepickerModule,
				NgbTimepickerModule,
				NoopAnimationsModule,
				SharedModule,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(InlineValueEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initalize input with given value when editing starts', () => {
		component.displayValue = TEST_TEXT;
		component.startEdit();

		expect(component.editValue).toEqual(TEST_TEXT);
	});

	it('should start editing with click', fakeAsync(() => {
		const displayElement = fixture.debugElement.query(
			By.css('.inline-value-display'),
		);
		displayElement.triggerEventHandler('click', null);
		tick();

		expect(component.isEditing).toBeTruthy();
	}));

	it('should focus input when starting edit', () => {
		component.displayValue = TEST_TEXT;
		component.startEdit();
		const inputElement = fixture.debugElement.query(By.css('input'));

		expect(document.activeElement).toBe(inputElement.nativeElement);
	});

	it('should emit final value when saving', () => {
		component.displayValue = TEST_TEXT;
		component.startEdit();

		let doneValue;

		component.doneEditing.subscribe((value) => {
			doneValue = value;
		});

		component.editValue = 'i have changed it...';

		component.save();

		expect(doneValue).toEqual(component.editValue);
	});

	it('should stop editing on cancel', async () => {
		const saveSpy = spyOn(component.doneEditing, 'emit');
		component.displayValue = TEST_TEXT;
		component.startEdit();

		expect(component.isEditing).toBeTruthy();

		component.cancel();

		expect(component.isEditing).toBeFalsy();
		expect(saveSpy).toHaveBeenCalledTimes(0);
	});

	it('should not save on cancel button click', async () => {
		const doneEditingSpy = spyOn(component.doneEditing, 'emit');
		component.displayValue = null;
		component.startEdit();

		const inputElem = component.inputElementRef
			.nativeElement as HTMLInputElement;

		expect(document.activeElement).toBe(inputElem);
		inputElem.value = 'new value!';

		fixture.detectChanges();

		const rootElement = fixture.debugElement.nativeElement as HTMLElement;
		const cancelButton = rootElement.querySelector(
			'button[name=cancel]',
		) as HTMLButtonElement;
		cancelButton.dispatchEvent(new Event('mousedown'));

		fixture.detectChanges();
		await fixture.whenStable();

		expect(doneEditingSpy).not.toHaveBeenCalled();
	});

	it('should not allow editing if canEdit is false', async () => {
		component.canEdit = false;

		fixture.detectChanges();
		component.startEdit();

		expect(component.isEditing).toBeFalsy();
	});

	it('should set initial date and time based on local time with no timezone passed', () => {
		const displayDT = formatDateISOString('2017-05-13T16:36:29.000000');
		component.displayValue = displayDT;
		component.type = 'date';
		fixture.detectChanges();

		component.startEdit();

		const local = moment.utc(displayDT).local();

		expect(component.ngbDate).toBeDefined();
		expect(component.ngbDate.day).toBe(momentFormatNum(local, 'D'));
		expect(component.ngbTime).toBeDefined();
		expect(component.ngbTime.hour).toBe(momentFormatNum(local, 'H'));
	});

	it('should set initial date and time based on timezone', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: '2017-05-13T16:36:29.000000',
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PST',
				stdOffset: '-08:00',
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();

		component.startEdit();

		const offset = getOffsetMomentFromDTString(
			record.displayDT,
			record.TimezoneVO,
		);

		expect(component.ngbDate).toBeDefined();
		expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
		expect(component.ngbTime).toBeDefined();
		expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
	});

	it('should default to current date and time based on timezone', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: null,
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PST',
				stdOffset: '-08:00',
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();

		const nowUtc = moment.utc();

		const offset = applyTimezoneOffset(nowUtc, record.TimezoneVO);

		component.startEdit();

		expect(component.ngbDate).toBeDefined();
		expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
		expect(component.ngbTime).toBeDefined();
		expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
	});

	it('should default to current date and time in local timezone when missing timezone', () => {
		const voData: RecordVOData = {
			displayDT: null,
			accessRole: 'access.role.owner',
		};

		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();

		const offset = moment.utc().local();

		component.startEdit();

		expect(component.ngbDate).toBeDefined();
		expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
		expect(component.ngbTime).toBeDefined();
		expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
	});

	it('should update edit value when date is changed', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: '2017-05-14T02:36:29.000000',
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PST',
				stdOffset: '-08:00',
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();

		component.startEdit();

		const offset = getOffsetMomentFromDTString(
			record.displayDT,
			record.TimezoneVO,
		);

		expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));

		const newDate = NgbDate.from({ year: 2017, month: 5, day: 10 });
		component.datePicker.dateSelect.emit(newDate);

		const utcDt = getUtcMomentFromDTString(component.editValue as string);

		expect(Number(utcDt.format('D'))).toEqual(11);
		expect(Number(utcDt.format('M'))).toEqual(newDate.month);
		expect(Number(utcDt.format('H'))).toEqual(2);
	});

	it('should default to displaying the time picker', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: '2017-05-14T02:36:29.000000',
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PST',
				stdOffset: '-08:00',
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();
		component.startEdit();
		fixture.detectChanges();

		const timePicker = fixture.debugElement.query(By.css('ngb-timepicker'));

		expect(component.dateOnly).toBeFalse();
		expect(timePicker).toBeTruthy();
	});

	it('should hide the time picker when dateOnly specified', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: '2017-05-14T02:36:29.000000',
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PST',
				stdOffset: '-08:00',
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		component.dateOnly = true;

		fixture.detectChanges();
		component.startEdit();
		fixture.detectChanges();

		const timePicker = fixture.debugElement.query(By.css('ngb-timepicker'));

		expect(component.dateOnly).toBeTrue();
		expect(timePicker).toBeNull();
	});

	it('should update edit value with just date when date is changed and timeOnly = true', () => {
		component.displayValue = '2020-05-02';
		component.type = 'date';
		component.dateOnly = true;
		fixture.detectChanges();

		component.startEdit();

		const newDate = new NgbDate(2019, 2, 15);

		component.ngbDate = newDate;
		component.onDateChange(newDate);

		expect(component.editValue).not.toBe(component.displayValue);
		expect((component.editValue as string).length).toBe(10);
	});

	it('should update edit value when time is changed', () => {
		const voData: RecordVOData = {
			accessRole: 'access.role.owner',
			displayDT: '2017-05-14T02:36:29.000000',
			TimezoneVO: {
				dstAbbrev: 'PDT',
				dstOffset: '-07:00',
				stdAbbrev: 'PDT',
				stdOffset: '-07:00',
				// Do not use DST so that this test passes all year long.
			},
		};
		const record = new RecordVO(voData);
		component.item = record;
		component.displayValue = record.displayDT;
		component.type = 'date';
		fixture.detectChanges();

		component.startEdit();

		const offset = getOffsetMomentFromDTString(
			record.displayDT,
			record.TimezoneVO,
		);

		expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));

		const newTime: NgbTimeStruct = {
			hour: 8,
			minute: 30,
			second: 58,
		};

		component.ngbTime = newTime;
		component.onTimeChange(newTime);

		expect(component.editValue).not.toBe(component.displayValue);

		const utcDt = getUtcMomentFromDTString(component.editValue as string);

		expect(Number(utcDt.format('D'))).toEqual(13);
		expect(Number(utcDt.format('h'))).toEqual(3);
	});

	it('should expand the title when hovering with the mouse over it', async () => {
		component.type = 'text';
		component.isPublicArchive = true;
		fixture.detectChanges();

		const nameContainer = fixture.debugElement.query(
			By.css('.inline-value-text'),
		).nativeElement;
		nameContainer.dispatchEvent(new Event('mouseenter'));
		fixture.detectChanges();

		await fixture.whenStable();

		expect(nameContainer.classList).toContain('is-name-hovered');
	});

	it('should support save a select element on change', async () => {
		component.type = 'select';
		component.selectOptions = [
			{ text: 'test1', value: 'test1' },
			{ text: 'test2', value: 'test2' },
		];
		const saveSpy = spyOn(component.doneEditing, 'emit');
		fixture.detectChanges();
		const select = fixture.debugElement.query(By.css('select')).nativeElement;
		select.value = 'test1';
		component.editValue = 'test1';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();

		expect(saveSpy).toHaveBeenCalled();
	});

	it('should not save a select element if the value has not changed', async () => {
		component.type = 'select';
		component.selectOptions = [
			{ text: 'test1', value: 'test1' },
			{ text: 'test2', value: 'test2' },
		];
		component.displayValue = 'test1';
		component.editValue = 'test1';
		fixture.detectChanges();

		const select = fixture.debugElement.query(By.css('select')).nativeElement;
		const saveSpy = spyOn(component.doneEditing, 'emit');

		select.value = 'test1';
		component.editValue = 'test1';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();

		expect(saveSpy).not.toHaveBeenCalled();
	});

	it('should start editing when clicking a non-link element', () => {
		component.canEdit = true;
		component.type = 'textarea';
		component.displayValue = 'Some content without a link';
		fixture.detectChanges();

		const displayEl = fixture.debugElement.query(
			By.css('.inline-value-display'),
		);

		displayEl.triggerEventHandler('click', {
			target: document.createElement('span'),
		});

		fixture.detectChanges();

		expect(component.isEditing).toBeTrue();
	});

	it('should NOT start editing when clicking on a link', () => {
		component.canEdit = true;
		component.type = 'textarea';
		component.displayValue = 'Some <a href="#">link</a> inside text';
		fixture.detectChanges();

		const displayEl = fixture.debugElement.query(
			By.css('.inline-value-display'),
		);

		const anchor = document.createElement('a');
		anchor.href = '#';
		anchor.innerText = 'link';

		displayEl.triggerEventHandler('click', {
			target: anchor,
		});

		fixture.detectChanges();

		expect(component.isEditing).toBeFalse();
	});
});
