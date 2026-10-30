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
import { ArchiveVO, FolderVO } from '@models/index';
import { RecordVO } from '@models/record-vo';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { LocationPickerComponent } from '@fileBrowser/components/location-picker/location-picker.component';
import { UncertainLocationPickerComponent } from '@fileBrowser/components/uncertain-location-picker/uncertain-location-picker.component';
import { ProfileEditComponent } from './profile-edit.component';

describe('ProfileEditComponent', () => {
	let component: ProfileEditComponent;
	let fixture: ComponentFixture<ProfileEditComponent>;

	const mockDialogRef = { close: jasmine.createSpy('close') };
	const mockDialogService = jasmine.createSpyObj('DialogCdkService', ['open']);
	mockDialogService.open.and.returnValue(mockDialogRef);

	const mockCookieService = jasmine.createSpyObj('CookieService', ['check']);
	const mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', [
		'isEnabled',
	]);
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
	const publicRootFromStela = new FolderVO({
		folderId: 3,
		folder_linkId: 4,
		archiveNbr: '0001-0003',
		type: 'public-root',
		view: 'grid' as any,
	});

	const mockAccountService = {
		getPrivateRoot: jasmine
			.createSpy('getPrivateRoot')
			.and.returnValue('root-folder'),
		getArchive: () => new ArchiveVO({ archiveNbr: 'a-1' }),
		getPublicRoot: () => publicRootFromStela,
		checkMinimumArchiveAccess: () => true,
	};

	const publicRootFromV1 = new FolderVO({
		folderId: 3,
		folder_linkId: 4,
		archiveNbr: '0001-0003',
		type: 'type.folder.root.public',
		view: 'folder.view.timeline',
		viewProperty: 'timeline-property',
		thumbArchiveNbr: '0001-0111',
		thumbURL200: 'old200',
		thumbURL500: 'old500',
		thumbURL1000: 'old1000',
		thumbURL2000: 'old2000',
	});

	function respondWithPublicRootFromV1(): void {
		mockApiService.folder.get.and.resolveTo(
			new FolderResponse({
				isSuccessful: true,
				Results: [{ data: [{ FolderVO: publicRootFromV1 }] }],
			}),
		);
	}

	async function openEditor(): Promise<void> {
		fixture = TestBed.createComponent(ProfileEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		await fixture.whenStable();
	}

	const mockApiService = {
		folder: {
			get: jasmine.createSpy('get'),
			updateRoot: jasmine
				.createSpy('updateRoot')
				.and.returnValue(Promise.resolve()),
		},
	};

	const mockFolderPickerService = {
		chooseRecord: jasmine.createSpy('chooseRecord'),
	};

	beforeEach(async () => {
		mockDialogService.open.calls.reset();
		mockFeatureFlagService.isEnabled.and.returnValue(false);
		mockApiService.folder.get.calls.reset();
		mockApiService.folder.updateRoot.calls.reset();
		mockFolderPickerService.chooseRecord.calls.reset();
		respondWithPublicRootFromV1();

		TestBed.configureTestingModule({
			declarations: [ProfileEditComponent, GetThumbnailPipe],
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
				{ provide: FeatureFlagService, useValue: mockFeatureFlagService },
			],
		}).compileComponents();

		await openEditor();
		mockDialogService.open.calls.reset();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open ProfileEditFirstTimeDialogComponent when showFirstTimeDialog is called', () => {
		component.totalProgress = 0; // Ensure the condition to open the dialog is met
		mockCookieService.check.and.returnValue(false);

		component.showFirstTimeDialog();

		expect(mockDialogService.open).toHaveBeenCalledOnceWith(
			jasmine.any(Function),
			{
				width: '760px',
				height: 'auto',
			},
		);
	});

	it('should open LocationPickerComponent when chooseLocationForItem is called', async () => {
		const item = {} as any;
		await component.chooseLocationForItem(item);

		expect(mockDialogService.open).toHaveBeenCalledOnceWith(
			LocationPickerComponent,
			{
				data: { profileItem: item },
				height: 'auto',
			},
		);
	});

	it('should open UncertainLocationPickerComponent when the uncertain-locations flag is enabled', async () => {
		const item = {} as any;
		mockFeatureFlagService.isEnabled.and.callFake(
			(flag: string) => flag === 'uncertain-locations',
		);

		await component.chooseLocationForItem(item);

		expect(mockDialogService.open).toHaveBeenCalledOnceWith(
			UncertainLocationPickerComponent,
			{
				data: { profileItem: item },
				height: 'auto',
			},
		);
	});

	it('should update banner picture when chooseBannerPicture succeeds', async () => {
		const mockRecord = new RecordVO({
			thumbURL200: 'new200',
			thumbURL500: 'new500',
			thumbURL1000: 'new1000',
			thumbURL2000: 'new2000',
			archiveNbr: 999,
		});
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

	it('should show the banner already set when the editor opens', () => {
		expect(mockApiService.folder.get).toHaveBeenCalledOnceWith([
			jasmine.objectContaining({ folderId: 3, type: 'public-root' }),
		]);

		expect(component.bannerThumbnail).toBe('old2000');
	});

	it('should write the banner with the view the v1 public root has, not the stela one', async () => {
		mockFolderPickerService.chooseRecord.and.resolveTo(
			new RecordVO({ archiveNbr: '0001-0999' }),
		);

		await component.chooseBannerPicture();

		const [[writtenFolder]] =
			mockApiService.folder.updateRoot.calls.mostRecent().args;

		expect(writtenFolder.folderId).toBe(3);
		expect(writtenFolder.view).toBe('folder.view.timeline');
		expect(writtenFolder.viewProperty).toBe('timeline-property');
		expect(writtenFolder.thumbArchiveNbr).toBe('0001-0999');
		expect(mockApiService.folder.get).toHaveBeenCalledTimes(1);
	});

	it('should load the v1 public root before the write when it failed to load on open', async () => {
		mockApiService.folder.get.and.rejectWith(
			new FolderResponse({ isSuccessful: false }),
		);
		await openEditor();
		respondWithPublicRootFromV1();
		mockFolderPickerService.chooseRecord.and.resolveTo(
			new RecordVO({ archiveNbr: '0001-0999' }),
		);

		await component.chooseBannerPicture();

		const [[writtenFolder]] =
			mockApiService.folder.updateRoot.calls.mostRecent().args;

		expect(writtenFolder.view).toBe('folder.view.timeline');
		expect(writtenFolder.viewProperty).toBe('timeline-property');
	});

	it('should write nothing when the v1 public root cannot be loaded at all', async () => {
		mockApiService.folder.get.and.rejectWith(
			new FolderResponse({ isSuccessful: false }),
		);
		await openEditor();

		await component.chooseBannerPicture();

		expect(mockFolderPickerService.chooseRecord).not.toHaveBeenCalled();
		expect(mockApiService.folder.updateRoot).not.toHaveBeenCalled();
	});

	it('should show a profile photo written onto the archive after the picker closes', () => {
		component.archive = new ArchiveVO({ archiveNbr: 'a-1' });

		expect(component.profileThumbnail).toBeNull();

		// promptForProfilePicture() updates this same instance rather than
		// replacing it, so the binding has to re-read an unchanged reference.
		component.archive.thumbURL200 = 'new200';

		expect(component.profileThumbnail).toBe('new200');
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
