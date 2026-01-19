import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { EventService } from '@shared/services/event/event.service';
import { CookieService } from 'ngx-cookie-service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FolderVO } from '@models/index';
import { RecordVO } from '@models/record-vo';
import { FolderResponse } from '@shared/services/api/folder.repo'; // adjust path if needed
import { ProfileEditComponent } from './profile-edit.component';

describe('ProfileEditComponent', () => {
	let component: ProfileEditComponent;
	let fixture: ComponentFixture<ProfileEditComponent>;

	const mockDialogRef = { close: jasmine.createSpy('close') };
	const mockDialogService = jasmine.createSpyObj('DialogCdkService', ['open']);
	mockDialogService.open.and.returnValue(mockDialogRef);

	const mockCookieService = jasmine.createSpyObj('CookieService', ['check']);
	mockCookieService.check.and.returnValue(false);

	const mockProfileService = jasmine.createSpyObj('ProfileService', [
		'calculateProfileProgress',
		'getProfileItemDictionary',
		'fetchProfileItems',
		'checkProfilePublic',
	]);
	mockProfileService.calculateProfileProgress.and.returnValue(0);
	mockProfileService.getProfileItemDictionary.and.returnValue({});
	mockProfileService.fetchProfileItems.and.returnValue(Promise.resolve());
	mockProfileService.checkProfilePublic.and.returnValue(true);
	const mockAccountService = {
		getPrivateRoot: jasmine
			.createSpy('getPrivateRoot')
			.and.returnValue('root-folder'),
	};

	const mockApiService = {
		folder: {
			updateRoot: jasmine
				.createSpy('updateRoot')
				.and.returnValue(Promise.resolve()),
		},
	};

	const mockFolderPickerService = {
		chooseRecord: jasmine.createSpy('chooseRecord'),
	};

	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [ProfileEditComponent],
			providers: [
				{ provide: DialogCdkService, useValue: mockDialogService },
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: MessageService, useValue: {} },
				{ provide: ProfileService, useValue: mockProfileService },
				{ provide: FolderPickerService, useValue: mockFolderPickerService },
				{ provide: PromptService, useValue: {} },
				{
					provide: EventService,
					useValue: {
						dispatch: () => {},
					},
				},
				{ provide: CookieService, useValue: mockCookieService },
				{ provide: DIALOG_DATA, useValue: {} },
				{ provide: DialogRef, useValue: mockDialogRef },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ProfileEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.publicRoot = new FolderVO({
			thumbArchiveNbr: 111,
			thumbURL200: 'old200',
			thumbURL500: 'old500',
			thumbURL1000: 'old1000',
			thumbURL2000: 'old2000',
		});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open ProfileEditFirstTimeDialogComponent when showFirstTimeDialog is called', () => {
		component.totalProgress = 0; // Ensure the condition to open the dialog is met
		mockCookieService.check.and.returnValue(false);

		component.showFirstTimeDialog();

		expect(mockDialogService.open).toHaveBeenCalledWith(jasmine.any(Function), {
			width: '760px',
			height: 'auto',
		});
	});

	it('should open LocationPickerComponent when chooseLocationForItem is called', async () => {
		const item = {} as any;
		await component.chooseLocationForItem(item);

		expect(mockDialogService.open).toHaveBeenCalledWith(jasmine.any(Function), {
			data: { profileItem: item },
			height: 'auto',
			width: '600px',
		});
	});

	it('should update banner picture when chooseBannerPicture succeeds', async () => {
		const mockRecord = new RecordVO({
			thumbURL200: 'new200',
			thumbURL500: 'new500',
			thumbURL1000: 'new1000',
			thumbURL2000: 'new2000',
		}) as any;
		mockRecord.archiveNumber = 999;
		mockFolderPickerService.chooseRecord.and.resolveTo(mockRecord);

		await component.chooseBannerPicture();

		expect(mockApiService.folder.updateRoot).toHaveBeenCalled();
		const [foldersArg, fieldsArg] =
			mockApiService.folder.updateRoot.calls.mostRecent().args;

		expect(fieldsArg).toEqual(['thumbArchiveNbr', 'view', 'viewProperty']);
		expect(foldersArg[0].thumbArchiveNbr).toBe(999);

		expect(component.publicRoot.thumbArchiveNbr).toBe(999);
		expect(component.publicRoot.thumbURL200).toBe('new200');
		expect(component.publicRoot.thumbURL500).toBe('new500');
		expect(component.publicRoot.thumbURL1000).toBe('new1000');
		expect(component.publicRoot.thumbURL2000).toBe('new2000');
	});

	it('should restore original thumbArchiveNbr when chooseBannerPicture throws FolderResponse', async () => {
		const originalValue = component.publicRoot.thumbArchiveNbr;

		mockFolderPickerService.chooseRecord.and.callFake(() => {
			throw new FolderResponse({});
		});

		await component.chooseBannerPicture();

		expect(component.publicRoot.thumbArchiveNbr).toBe(originalValue);
	});
});
