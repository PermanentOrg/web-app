import { TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EditDateTimeModalService } from './edit-date-time-modal.service';
import { EditDateTimeModalComponent } from './edit-date-time-modal.component';
import { EditDateModel, Meridian } from './edit-date-time.model';

describe('EditDateTimeModalService', () => {
	let service: EditDateTimeModalService;
	let dialogCdkServiceSpy: jasmine.SpyObj<DialogCdkService>;
	let mockDialogRef: jasmine.SpyObj<
		DialogRef<EditDateModel, EditDateTimeModalComponent>
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
				EditDateTimeModalService,
				{ provide: DialogCdkService, useValue: dialogCdkServiceSpy },
			],
		});

		service = TestBed.inject(EditDateTimeModalService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should open EditDateTimeModalComponent via DialogCdkService', () => {
		service.open(mockData);

		expect(dialogCdkServiceSpy.open).toHaveBeenCalledWith(
			EditDateTimeModalComponent,
			jasmine.objectContaining({
				data: mockData,
				hasBackdrop: true,
				panelClass: 'edit-date-time-modal-dialog-panel',
			}),
		);
	});

	it('should return a DialogRef', () => {
		const result = service.open(mockData);

		expect(result).toBe(mockDialogRef);
	});
});
