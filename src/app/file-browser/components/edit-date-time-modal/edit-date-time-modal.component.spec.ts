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
			format: 'am',
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
		expect(component.time().format).toBe('am');
		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeFalse();
		expect(component.qualifiers().unknown).toBeFalse();

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

	it('should initialize endQualifiers from dialog data', () => {
		component.data = {
			...mockDialogData,
			endDate: { year: '2026', month: '01', day: '15' },
			endTime: { format: 'am' },
			endQualifiers: { approximate: false, uncertain: true, unknown: false },
		};
		component.ngOnInit();

		expect(component.endQualifiers().uncertain).toBeTrue();
		expect(component.endQualifiers().approximate).toBeFalse();
	});

	it('should save start form state with unknown false when data has unknown true', () => {
		const unknownData: DateTimeModel = {
			qualifiers: { approximate: false, uncertain: false, unknown: true },
			date: { year: '', month: '', day: '' },
			time: {
				hours: '',
				minutes: '',
				seconds: '',
				format: 'am',
			},
		};

		component.data = unknownData;
		component.ngOnInit();

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.savedStartState()).not.toBeNull();
		expect(component.savedStartState().qualifiers.unknown).toBeFalse();
	});

	it('should save end form state when data has end unknown true', () => {
		component.data = {
			...mockDialogData,
			endDate: { year: '', month: '', day: '' },
			endTime: { format: 'am' },
			endQualifiers: { approximate: false, uncertain: false, unknown: true },
		};
		component.ngOnInit();

		expect(component.endQualifiers().unknown).toBeTrue();
		expect(component.savedEndState()).not.toBeNull();
	});

	// --- Time updates via onTimeChange ---

	it('should update time fields via onTimeChange', () => {
		component.onTimeChange(
			{ hours: '02', minutes: '30', seconds: '15', format: 'pm' },
			component.time,
		);

		expect(component.time().hours).toBe('02');
		expect(component.time().minutes).toBe('30');
		expect(component.time().seconds).toBe('15');
		expect(component.time().format).toBe('pm');
	});

	it('should update end time fields via onTimeChange', () => {
		component.onTimeChange(
			{ hours: '06', minutes: '45', seconds: '00', format: 'am' },
			component.endTime,
		);

		expect(component.endTime().hours).toBe('06');
		expect(component.endTime().minutes).toBe('45');
	});

	// --- Date range toggle ---

	it('should toggle date range', () => {
		expect(component.useDateRange()).toBeFalse();
		component.toggleDateRange();

		expect(component.useDateRange()).toBeTrue();
		component.toggleDateRange();

		expect(component.useDateRange()).toBeFalse();
	});

	// --- Start-side qualifiers ---

	it('should toggle start approximate on and off', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});
		component.onQualifierChange(DateQualifier.Approximate, false);

		expect(component.qualifiers().approximate).toBeTrue();

		component.onQualifierChange(DateQualifier.Approximate, false);

		expect(component.qualifiers().approximate).toBeFalse();
	});

	it('should allow start approximate and uncertain to be active at the same time', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		component.onQualifierChange(DateQualifier.Approximate, false);
		component.onQualifierChange(DateQualifier.Uncertain, false);

		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeTrue();
	});

	it('should turn off start approximate and uncertain when start unknown is toggled on', () => {
		component.qualifiers.set({
			approximate: true,
			uncertain: true,
			unknown: false,
		});

		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.qualifiers().approximate).toBeFalse();
		expect(component.qualifiers().uncertain).toBeFalse();
	});

	it('should turn off start unknown when start approximate is toggled on', () => {
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: true,
		});

		component.onQualifierChange(DateQualifier.Approximate, false);

		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().unknown).toBeFalse();
	});

	it('should reset start fields and disable them when start unknown is toggled on', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.startFieldsDisabled()).toBeTrue();
		expect(component.date().year).toBe('');
		expect(component.date().month).toBe('');
		expect(component.time().hours).toBe('');
	});

	it('should restore start form state when start unknown is toggled off', () => {
		component.qualifiers.set({
			approximate: true,
			uncertain: true,
			unknown: false,
		});
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.qualifiers().unknown).toBeTrue();
		expect(component.date().year).toBe('');

		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.qualifiers().unknown).toBeFalse();
		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeTrue();
		expect(component.startFieldsDisabled()).toBeFalse();
		expect(component.date().year).toBe('2026');
		expect(component.date().month).toBe('02');
		expect(component.time().hours).toBe('10');
		expect(component.savedStartState()).toBeNull();
	});

	it('should enable start fields when toggling start unknown off from initial unknown state', () => {
		const unknownData: DateTimeModel = {
			qualifiers: { approximate: false, uncertain: false, unknown: true },
			date: { year: '', month: '', day: '' },
			time: {
				hours: '',
				minutes: '',
				seconds: '',
				format: 'am',
			},
		};

		component.data = unknownData;
		component.ngOnInit();

		expect(component.startFieldsDisabled()).toBeTrue();

		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.qualifiers().unknown).toBeFalse();
		expect(component.startFieldsDisabled()).toBeFalse();
	});

	it('should show XXXX-XX-XX as EDTF value when unknown is on (no range)', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.onQualifierChange(DateQualifier.Unknown, false);

		expect(component.edtfValue()).toBe('XXXX-XX-XX');
	});

	// --- End-side qualifiers ---

	it('should toggle end qualifiers independently of start qualifiers', () => {
		component.useDateRange.set(true);
		component.qualifiers.set({
			approximate: true,
			uncertain: false,
			unknown: false,
		});
		component.endQualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		component.onQualifierChange(DateQualifier.Uncertain, true);

		expect(component.qualifiers().approximate).toBeTrue();
		expect(component.qualifiers().uncertain).toBeFalse();
		expect(component.endQualifiers().uncertain).toBeTrue();
		expect(component.endQualifiers().approximate).toBeFalse();
	});

	it('should reset end fields when end unknown is toggled on', () => {
		component.useDateRange.set(true);
		component.endDate.set({ year: '2026', month: '02', day: '18' });
		component.endTime.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown, true);

		expect(component.endQualifiers().unknown).toBeTrue();
		expect(component.endFieldsDisabled()).toBeTrue();
		expect(component.endDate().year).toBe('');
		expect(component.endTime().hours).toBe('');
	});

	it('should restore end form state when end unknown is toggled off', () => {
		component.useDateRange.set(true);
		component.endQualifiers.set({
			approximate: true,
			uncertain: false,
			unknown: false,
		});
		component.endDate.set({ year: '2026', month: '02', day: '18' });
		component.endTime.update((t) => ({ ...t, hours: '10' }));

		component.onQualifierChange(DateQualifier.Unknown, true);

		expect(component.endQualifiers().unknown).toBeTrue();
		expect(component.endDate().year).toBe('');

		component.onQualifierChange(DateQualifier.Unknown, true);

		expect(component.endQualifiers().unknown).toBeFalse();
		expect(component.endQualifiers().approximate).toBeTrue();
		expect(component.endDate().year).toBe('2026');
		expect(component.endTime().hours).toBe('10');
		expect(component.savedEndState()).toBeNull();
	});

	it('should produce empty-slot EDTF when end unknown is on in a range', () => {
		component.useDateRange.set(true);
		component.date.set({ year: '1985', month: '04', day: '12' });
		component.time.set({ hours: '', minutes: '', seconds: '', format: 'am' });
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});
		component.endQualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: true,
		});

		expect(component.edtfValue()).toBe('1985-04-12/');
	});

	// --- clearStart / clearEnd ---

	it('should clear start fields only', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.update((t) => ({ ...t, hours: '10' }));
		component.qualifiers.set({
			approximate: true,
			uncertain: false,
			unknown: false,
		});
		component.endDate.set({ year: '2030', month: '06', day: '01' });

		component.clearStart();

		expect(component.date().year).toBe('');
		expect(component.time().hours).toBe('');
		expect(component.qualifiers().approximate).toBeFalse();
		expect(component.savedStartState()).toBeNull();
		expect(component.endDate().year).toBe('2030');
	});

	it('should clear end fields only', () => {
		component.endDate.set({ year: '2026', month: '02', day: '18' });
		component.endTime.update((t) => ({ ...t, hours: '10' }));
		component.endQualifiers.set({
			approximate: false,
			uncertain: true,
			unknown: false,
		});
		component.date.set({ year: '1985' });

		component.clearEnd();

		expect(component.endDate().year).toBe('');
		expect(component.endTime().hours).toBe('');
		expect(component.endQualifiers().uncertain).toBeFalse();
		expect(component.savedEndState()).toBeNull();
		expect(component.date().year).toBe('1985');
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

	it('should include endDate, endTime and endQualifiers when useDateRange is on', () => {
		component.useDateRange.set(true);
		component.endDate.set({ year: '2026', month: '12', day: '31' });
		component.endQualifiers.set({
			approximate: false,
			uncertain: true,
			unknown: false,
		});
		component.onSave();

		const result = dialogRefSpy.close.calls.mostRecent()
			.args[0] as DateTimeModel;

		expect(result.endDate).toEqual({ year: '2026', month: '12', day: '31' });
		expect(result.endQualifiers).toEqual({
			approximate: false,
			uncertain: true,
			unknown: false,
		});
	});

	it('should not include endDate or endQualifiers when useDateRange is off', () => {
		component.useDateRange.set(false);
		component.onSave();

		const result = dialogRefSpy.close.calls.mostRecent()
			.args[0] as DateTimeModel;

		expect(result.endDate).toBeUndefined();
		expect(result.endQualifiers).toBeUndefined();
	});

	// --- EDTF computed ---

	it('should compute EDTF with date only', () => {
		component.date.set({ year: '2026', month: '', day: '' });
		component.time.set({
			hours: '',
			minutes: '',
			seconds: '',
			format: 'am',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026');
	});

	it('should show error when time has invalid hours', () => {
		component.date.set({ year: '2026', month: '02', day: '18' });
		component.time.set({
			hours: '13',
			minutes: '30',
			seconds: '00',
			format: 'pm',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.isEdtfValid()).toBeFalse();
		expect(component.edtfErrorMessage()).toBeTruthy();
		expect(component.edtfValue()).toBe('');
	});

	it('should X-pad missing month when day is provided', () => {
		component.date.set({ year: '2026', month: '', day: '18' });
		component.time.set({
			hours: '',
			minutes: '',
			seconds: '',
			format: 'am',
		});
		component.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});

		expect(component.edtfValue()).toBe('2026-XX-18');
	});
});
