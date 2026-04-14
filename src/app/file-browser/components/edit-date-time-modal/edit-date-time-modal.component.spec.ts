import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
	DateTimeModel,
	DateQualifier,
} from '@shared/services/edtf-service/edtf.service';
import { EditDateTimeModalComponent } from './edit-date-time-modal.component';

describe('EditDateTimeModalComponent', () => {
	let component: EditDateTimeModalComponent;
	let fixture: ComponentFixture<EditDateTimeModalComponent>;
	let dialogRefSpy: jasmine.SpyObj<DialogRef>;

	const mockDialogData: DateTimeModel = {
		qualifiers: {
			approximate: true,
			uncertain: false,
			unknown: false,
		},
		date: { year: '1930', month: '', day: '' },
		time: {
			hours: '11',
			minutes: '',
			seconds: '',
			am: true,
			pm: false,
			timezoneOffset: 'GMT+01:00',
			timezoneName: 'Central European Standard Time',
		},
	};

	beforeEach(async () => {
		dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);

		await TestBed.configureTestingModule({
			imports: [EditDateTimeModalComponent],
			providers: [
				{ provide: DialogRef, useValue: dialogRefSpy },
				{ provide: DIALOG_DATA, useValue: mockDialogData },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(EditDateTimeModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should inject dialog data', () => {
		expect(component.data).toEqual(mockDialogData);
	});

	// --- Initialization ---

	it('should initialize fields from dialog data', () => {
		expect(component.date().year).toBe('1930');
		expect(component.time().hours).toBe('11');
		expect(component.time().am).toBe(true);
		expect(component.time().pm).toBe(false);
		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeFalse();
		expect(component.qualifiers().unknown).toBeFalse();
		expect(component.time().timezoneOffset).toBe('GMT+01:00');
		expect(component.time().timezoneName).toBe(
			'Central European Standard Time',
		);

		expect(component.useDateRange()).toBeFalse();
	});

	it('should enable useDateRange when endDate is provided', () => {
		component.data = {
			...mockDialogData,
			endDate: { year: '2026', month: '01', day: '15' },
		};
		component.ngOnInit();

		expect(component.useDateRange()).toBeTrue();
		expect(component.endDate().year).toBe('2026');
	});

	it('should save form state with unknown false when data has unknown true', () => {
		const unknownData: DateTimeModel = {
			qualifiers: { approximate: false, uncertain: false, unknown: true },
			date: { year: '', month: '', day: '' },
			time: {
				hours: '',
				minutes: '',
				seconds: '',
				am: true,
				pm: false,
				timezoneOffset: '',
				timezoneName: '',
			},
		};

		component.data = unknownData;
		component.ngOnInit();

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.savedFormState()).not.toBeNull();
		expect(component.savedFormState().qualifiers.unknown).toBeFalse();
	});

	// --- Time updates via onTimeChange ---

	it('should update time fields via onTimeChange', () => {
		component.onTimeChange(
			{ hours: '02', minutes: '30', seconds: '15', am: false, pm: true },
			component.time,
		);

		expect(component.time().hours).toBe('02');
		expect(component.time().minutes).toBe('30');
		expect(component.time().seconds).toBe('15');
		expect(component.time().pm).toBe(true);
	});

	it('should update end time fields via onTimeChange', () => {
		component.onTimeChange(
			{ hours: '06', minutes: '45', seconds: '00', am: true, pm: false },
			component.endTime,
		);

		expect(component.endTime().hours).toBe('06');
		expect(component.endTime().minutes).toBe('45');
	});

	it('should preserve timezone when updating time via onTimeChange', () => {
		component.time.set({
			hours: '10',
			minutes: '00',
			seconds: '00',
			am: true,
			pm: false,
			timezoneOffset: 'GMT-05:00',
			timezoneName: 'Eastern Standard Time',
		});
		component.onTimeChange(
			{ hours: '11', minutes: '30', seconds: '00', am: true, pm: false },
			component.time,
		);

		expect(component.time().hours).toBe('11');
		expect(component.time().timezoneOffset).toBe('GMT-05:00');
		expect(component.time().timezoneName).toBe('Eastern Standard Time');
	});

	// --- Timezone updates via onTimezoneChange ---

	it('should update timezone on time signal via onTimezoneChange', () => {
		component.onTimezoneChange(
			{ offset: 'GMT-05:00', name: 'Eastern Standard Time' },
			component.time,
		);

		expect(component.time().timezoneOffset).toBe('GMT-05:00');
		expect(component.time().timezoneName).toBe('Eastern Standard Time');
	});

	it('should update timezone on endTime signal via onTimezoneChange', () => {
		component.onTimezoneChange(
			{ offset: 'GMT+09:00', name: 'Japan Standard Time' },
			component.endTime,
		);

		expect(component.endTime().timezoneOffset).toBe('GMT+09:00');
		expect(component.endTime().timezoneName).toBe('Japan Standard Time');
	});

	// --- Date range toggle ---

	it('should toggle date range', () => {
		expect(component.useDateRange()).toBeFalse();
		component.toggleDateRange();

		expect(component.useDateRange()).toBeTrue();
		component.toggleDateRange();

		expect(component.useDateRange()).toBeFalse();
	});

	// --- Qualifiers ---

	it('should toggle approximate on and off', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});
		component.onQualifierChange(DateQualifier.Approximate);

		expect(component.qualifiers().approximate).toBeTrue();

		component.onQualifierChange(DateQualifier.Approximate);

		expect(component.qualifiers().approximate).toBeFalse();
	});

	it('should allow approximate and uncertain to be active at the same time', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		component.onQualifierChange(DateQualifier.Approximate);
		component.onQualifierChange(DateQualifier.Uncertain);

		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeTrue();
	});

	it('should turn off approximate and uncertain when unknown is toggled on', () => {
		component.qualifiers.set({
			approximate: true,
			uncertain: true,
			unknown: false,
		});

		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.qualifiers().approximate).toBeFalse();
		expect(component.qualifiers().uncertain).toBeFalse();
	});

	it('should turn off unknown when approximate is toggled on', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: true,
		});

		component.onQualifierChange(DateQualifier.Approximate);

		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().unknown).toBeFalse();
	});

	it('should reset form and disable fields when unknown is toggled on', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.fieldsDisabled()).toBeTrue();
		expect(component.date().year).toBe('');
		expect(component.date().month).toBe('');
		expect(component.time().hours).toBe('');
	});

	it('should restore form state including qualifiers when unknown is toggled off', () => {
		component.qualifiers.set({
			approximate: true,
			uncertain: true,
			unknown: false,
		});
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.date().year).toBe('');

		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.qualifiers().unknown).toBeFalse();
		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeTrue();
		expect(component.fieldsDisabled()).toBeFalse();
		expect(component.date().year).toBe('2026');
		expect(component.date().month).toBe('02');
		expect(component.time().hours).toBe('10');
		expect(component.savedFormState()).toBeNull();
	});

	it('should enable form when toggling unknown off from initial unknown state', () => {
		const unknownData: DateTimeModel = {
			qualifiers: { approximate: false, uncertain: false, unknown: true },
			date: { year: '', month: '', day: '' },
			time: {
				hours: '',
				minutes: '',
				seconds: '',
				am: true,
				pm: false,
				timezoneOffset: '',
				timezoneName: '',
			},
		};

		component.data = unknownData;
		component.ngOnInit();

		expect(component.fieldsDisabled()).toBeTrue();

		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.qualifiers().unknown).toBeFalse();
		expect(component.fieldsDisabled()).toBeFalse();
	});

	it('should show xxxx-xx-xx as EDTF value when unknown is on', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.onQualifierChange(DateQualifier.Unknown);

		expect(component.edtfValue()).toBe('xxxx-xx-xx');
	});

	// --- clearAll ---

	it('should clear all fields', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));
		component.qualifiers.set({
			approximate: true,
			uncertain: false,
			unknown: false,
		});

		component.clearAll();

		expect(component.date().year).toBe('');
		expect(component.time().hours).toBe('');
		expect(component.qualifiers().approximate).toBeFalse();
		expect(component.savedFormState()).toBeNull();
	});

	// --- Dialog actions ---

	it('should close dialog on cancel', () => {
		component.onCancel();

		expect(dialogRefSpy.close).toHaveBeenCalledWith();
	});

	it('should close dialog with form data on save', () => {
		component.onSave();

		expect(dialogRefSpy.close).toHaveBeenCalledWith(
			jasmine.objectContaining({
				qualifiers: { approximate: true, uncertain: false, unknown: false },
				date: { year: '1930', month: '', day: '' },
			}),
		);
	});

	it('should include endDate and endTime in save when useDateRange is on', () => {
		component.useDateRange.set(true);
		component.endDate.set({ year: '2026', month: '12', day: '31' });
		component.onSave();

		const result = dialogRefSpy.close.calls.mostRecent()
			.args[0] as DateTimeModel;

		expect(result.endDate).toEqual({ year: '2026', month: '12', day: '31' });
	});

	it('should not include endDate in save when useDateRange is off', () => {
		component.useDateRange.set(false);
		component.onSave();

		const result = dialogRefSpy.close.calls.mostRecent()
			.args[0] as DateTimeModel;

		expect(result.endDate).toBeUndefined();
	});

	// --- EDTF computed ---

	it('should compute EDTF value from date and time', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.set({
			hours: '10',
			minutes: '30',
			seconds: '00',
			am: true,
			pm: false,
			timezoneOffset: 'GMT+01:00',
			timezoneName: 'Central European Standard Time',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026-02-18T10:30:00+01:00');
	});

	it('should compute EDTF with date only', () => {
		component.date.set({ year: '2026', month: '', day: '' });
		component.time.set({
			hours: '',
			minutes: '',
			seconds: '',
			am: true,
			pm: false,
			timezoneOffset: 'GMT+01:00',
			timezoneName: 'Central European Standard Time',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026');
	});

	it('should not include time with invalid hours in EDTF', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.set({
			hours: '13',
			minutes: '30',
			seconds: '00',
			am: false,
			pm: true,
			timezoneOffset: '',
			timezoneName: '',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026-02-18');
	});

	it('should not include day without month in EDTF', () => {
		component.date.set({ year: '2026', month: '', day: '18' });
		component.time.set({
			hours: '',
			minutes: '',
			seconds: '',
			am: true,
			pm: false,
			timezoneOffset: '',
			timezoneName: '',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026');
	});
});
