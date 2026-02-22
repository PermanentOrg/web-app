import { TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EditDateTimeService } from './edit-date-time.service';
import { EditDateTimeComponent } from './edit-date-time.component';
import { EditDateModel, Meridian } from './edit-date-time.model';

describe('EditDateTimeService', () => {
	let service: EditDateTimeService;
	let dialogCdkServiceSpy: jasmine.SpyObj<DialogCdkService>;
	let mockDialogRef: jasmine.SpyObj<
		DialogRef<EditDateModel, EditDateTimeComponent>
	>;

	const mockData: EditDateModel = {
		qualifiers: { approximate: false, uncertain: false, unknown: false },
		date: { year: '2026', month: '02', day: '18' },
		time: {
			hours: '10',
			minutes: '30',
			seconds: '',
			amPm: Meridian.AM,
			timezoneOffset: 'GMT+01:00',
			timezoneName: 'Central European Standard Time',
		},
	};

	beforeEach(() => {
		mockDialogRef = jasmine.createSpyObj('DialogRef', ['close']);
		dialogCdkServiceSpy = jasmine.createSpyObj('DialogCdkService', ['open']);
		dialogCdkServiceSpy.open.and.returnValue(mockDialogRef);

		TestBed.configureTestingModule({
			providers: [
				EditDateTimeService,
				{ provide: DialogCdkService, useValue: dialogCdkServiceSpy },
			],
		});

		service = TestBed.inject(EditDateTimeService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should open EditDateTimeComponent via DialogCdkService', () => {
		service.open(mockData);

		expect(dialogCdkServiceSpy.open).toHaveBeenCalledWith(
			EditDateTimeComponent,
			jasmine.objectContaining({
				data: mockData,
				hasBackdrop: true,
				panelClass: 'edit-date-time-dialog-panel',
			}),
		);
	});

	it('should return a DialogRef', () => {
		const result = service.open(mockData);

		expect(result).toBe(mockDialogRef);
	});
});
