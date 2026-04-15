import {
	fakeAsync,
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
	tick,
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import {
	Router,
	ActivatedRoute,
	ActivatedRouteSnapshot,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';

import { SharedModule } from '@shared/shared.module';
import * as Testing from '@root/test/testbedConfig';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { AccountVO, ArchiveVO, RecordVO } from '@root/app/models';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { Subject } from 'rxjs';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { ApiService } from '@shared/services/api/api.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { FilesystemService } from '@root/app/filesystem/filesystem.service';
import { MessageService } from '@shared/services/message/message.service';
import { CreateAccountDialogComponent } from '../create-account-dialog/create-account-dialog.component';
import { SharePreviewComponent } from './share-preview.component';

import { vi } from 'vitest';

export const mockAccountService = { getAccount: vi.fn(), getArchive: vi.fn(), isLoggedIn: vi.fn(), signUp: vi.fn(), logIn: vi.fn(), refreshArchives: vi.fn(), getArchives: vi.fn(), changeArchive: vi.fn(), promptForArchiveChange: vi.fn(), setRedirect: vi.fn() } as any;

// Provide default return values
const defaultAccount = new AccountVO({ primaryEmail: 'test@example.com' });
const defaultArchive = new ArchiveVO({ archiveId: 123 });

const mockGoogleAnalyticsService = {
	sendEvent: vi.fn(),
};

mockAccountService.getAccount.mockReturnValue(defaultAccount);
mockAccountService.getArchive.mockReturnValue(defaultArchive);
mockAccountService.isLoggedIn.mockReturnValue(true);
mockAccountService.signUp.mockReturnValue(Promise.resolve(defaultAccount));

const authResponse = new AuthResponse({});
authResponse.needsMFA = () => false;
mockAccountService.logIn.mockReturnValue(Promise.resolve(authResponse));

mockAccountService.refreshArchives.mockReturnValue(Promise.resolve());
mockAccountService.getArchives.mockReturnValue([defaultArchive]);
mockAccountService.changeArchive.mockReturnValue(Promise.resolve());
mockAccountService.promptForArchiveChange.mockReturnValue(Promise.resolve());
mockAccountService.setRedirect.mockImplementation(() => {});

// Subjects for subscriptions
mockAccountService.archiveChange = new Subject<ArchiveVO>();
mockAccountService.accountChange = new Subject<AccountVO>();

const mockShareLinksService = {
	currentShareToken: null,
	isUnlistedShare: () => true,
};

const mockFilesystemService = {
	getFolder: vi.fn().mockReturnValue(Promise.resolve({})),
};

const mockMessageService = {
	showMessage: vi.fn(),
};

describe('SharePreviewComponent', () => {
	let component: SharePreviewComponent;
	let fixture: ComponentFixture<SharePreviewComponent>;
	let dialog: DialogCdkService;
	let router: Router;
	let apiService: ApiService;

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(SharedModule, RouterTestingModule);
		config.declarations.push(SharePreviewComponent);

		const mockRoute = new ActivatedRoute();
		mockRoute.snapshot = new ActivatedRouteSnapshot();
		mockRoute.snapshot.data = {
			sharePreviewVO: {
				ArchiveVO: {},
				FolderVO: {},
				AccountVO: { fullName: 'Sharer Name' },
				ShareVO: { accessRole: 'viewer', status: 'pending' },
				status: 'pending',
			},
			currentFolder: { displayName: 'test', archiveId: 123 },
		};
		mockRoute.snapshot.params = { shareToken: 'test' };
		mockRoute.snapshot.queryParams = { requestAccess: 'test' };

		const firstChild = new ActivatedRouteSnapshot();
		firstChild.data = { sharePreviewView: {} };
		vi.spyOn(mockRoute.snapshot, 'firstChild', 'get').mockReturnValue(
			firstChild,
		);

		const parent = new ActivatedRoute();
		vi.spyOn(mockRoute, 'parent', 'get').mockReturnValue(parent);

		config.providers.push({
			provide: ActivatedRoute,
			useValue: mockRoute,
		});

		config.providers.push({
			provide: ShareLinksService,
			useValue: mockShareLinksService,
		});

		config.providers.push({
			provide: GoogleAnalyticsService,
			useValue: mockGoogleAnalyticsService,
		});

		config.providers.push({
			provide: FilesystemService,
			useValue: mockFilesystemService,
		});

		config.providers.push({
			provide: MessageService,
			useValue: mockMessageService,
		});

		await TestBed.configureTestingModule({...config, schemas: [CUSTOM_ELEMENTS_SCHEMA]}).compileComponents();

		dialog = TestBed.inject(DialogCdkService);
		router = TestBed.inject(Router);
		apiService = TestBed.inject(ApiService);
		vi.spyOn(router, 'navigate');

		fixture = TestBed.createComponent(SharePreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should mark it as unlisted share if restrictions are none', fakeAsync(() => {
		vi.spyOn(mockShareLinksService, 'isUnlistedShare').mockReturnValue(true);
		component.ngOnInit();

		expect(mockShareLinksService.isUnlistedShare).toHaveBeenCalled();
		tick(1005);

		expect(component.isUnlistedShare).toEqual(true);
	}));

	it('should open dialog shortly after loading if user is logged out and it is not an unlisted share', fakeAsync(() => {
		const dialogRefSpy = { close: vi.fn() } as any;
		const dialogSpy = vi.spyOn(dialog, 'open').mockReturnValue(dialogRefSpy);

		component.isLoggedIn = false;
		component.isUnlistedShare = false;
		component.showCreateAccountDialog();
		tick(1005);

		expect(dialogSpy).toHaveBeenCalledWith(CreateAccountDialogComponent, {
			data: { sharerName: 'Sharer Name' },
		});
	}));

	it('should not open dialog if user is logged out, but it is an unlisted share', fakeAsync(() => {
		const dialogRefSpy = { close: vi.fn() } as any;
		const dialogSpy = vi.spyOn(dialog, 'open').mockReturnValue(dialogRefSpy);

		component.isLoggedIn = false;
		component.isUnlistedShare = true;
		component.ngOnInit();
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog if user is logged in and it is not an unlisted share', fakeAsync(() => {
		const dialogRefSpy = { close: vi.fn() } as any;
		const dialogSpy = vi.spyOn(dialog, 'open').mockReturnValue(dialogRefSpy);

		component.isLoggedIn = true;
		component.isUnlistedShare = false;
		component.ngOnInit();
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog shortly after loading if user is logged in and share is unlisted', fakeAsync(() => {
		const dialogSpy = vi.spyOn(dialog, 'open');
		component.isLoggedIn = true;
		component.isUnlistedShare = true;
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog if already open', () => {
		const dialogSpy = vi.spyOn(dialog, 'open');
		component.createAccountDialogIsOpen = true;

		component.showCreateAccountDialog();

		expect(dialogSpy).not.toHaveBeenCalled();
	});

	it('should open dialog when a thumbnail is clicked', fakeAsync(() => {
		const dialogRefSpy = { close: vi.fn() } as any;
		const dialogSpy = vi.spyOn(dialog, 'open').mockReturnValue(dialogRefSpy);

		const mockFileList = { itemClicked: new EventEmitter<any>() };

		component.isUnlistedShare = false;
		component.subscribeToItemClicks(mockFileList);
		mockFileList.itemClicked.emit({
			item: new RecordVO({}),
			selectable: false,
		});
		tick();

		expect(dialogSpy).toHaveBeenCalledWith(CreateAccountDialogComponent, {
			data: { sharerName: 'Sharer Name' },
		});
	}));

	it('should unsubscribe from item clicks', () => {
		const mockFileList = { itemClicked: new EventEmitter<any>() };
		component.subscribeToItemClicks(mockFileList);
		const unsubscribeSpy = vi.spyOn(
			component.fileListClickListener,
			'unsubscribe',
		);
		component.unsubscribeFromItemClicks();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should toggle cover visibility', () => {
		component.showCover = false;
		component.toggleCover();

		expect(component.showCover).toBe(true);

		component.toggleCover();

		expect(component.showCover).toBe(false);
	});

	it('should stop event propagation', () => {
		const event = { stopPropagation: vi.fn() } as any;
		component.stopPropagation(event);

		expect(event.stopPropagation).toHaveBeenCalled();
	});

	it('should navigate to auth login if relationship share', () => {
		component.isRelationshipShare = true;
		component.navToAuth();

		expect(router.navigate).toHaveBeenCalledWith(['/app', 'auth', 'login']);
	});

	it('should navigate to auth signup if not relationship share', () => {
		component.isRelationshipShare = false;
		component.navToAuth();

		expect(router.navigate).toHaveBeenCalledWith(['/app', 'auth', 'signup']);
	});

	it('should reload share preview data for link share', fakeAsync(() => {
		component.isLinkShare = true;
		component.isRelationshipShare = false;

		const mockVO = { ShareVO: { status: 'ok', accessRole: 'editor' } };
		vi.spyOn(apiService.share, 'checkShareLink').mockReturnValue(
			Promise.resolve({
				isSuccessful: true,
				getShareByUrlVO: () => mockVO,
			} as unknown as ShareResponse),
		);

		vi.spyOn(component, 'checkAccess');

		component.reloadSharePreviewData();
		tick(1005);

		expect(apiService.share.checkShareLink).toHaveBeenCalled();
		expect(component.sharePreviewVO).toEqual(mockVO);
		expect(component.checkAccess).toHaveBeenCalled();
	}));

	it('should reload share preview data for relationship share', fakeAsync(() => {
		const mockVO = { ShareVO: { status: 'ok', accessRole: 'owner' } };
		vi.spyOn(apiService.share, 'getShareForPreview').mockReturnValue(
			Promise.resolve({
				getShareVO: () => mockVO,
			} as unknown as ShareResponse),
		);
		component.isLinkShare = false;
		component.isRelationshipShare = true;

		vi.spyOn(component, 'checkAccess');

		component.reloadSharePreviewData();
		tick(1005);

		expect(apiService.share.getShareForPreview).toHaveBeenCalled();
		expect(component.sharePreviewVO).toEqual(mockVO);
		expect(component.checkAccess).toHaveBeenCalled();
	}));

	it('should request access and not show cover', fakeAsync(() => {
		component.archiveConfirmed = false;
		component.chooseArchiveText = 'Choose archive';
		component.shareToken = 'mock-token';
		component.shareAccount = {
			fullName: 'Sharer Name',
		} as unknown as AccountVO;

		component.onRequestAccessClick();
		tick(2005);

		expect(component.hasRequested).toBe(true);
		expect(component.showCover).toBe(false);
	}));

	it('should request access and show pending message when status is pending', fakeAsync(() => {
		const mockResponse = {
			getShareVO: () => ({ status: 'status.generic.pending' }),
		};
		vi.spyOn(apiService.share, 'requestShareAccess').mockReturnValue(
			Promise.resolve(mockResponse as any),
		);

		component.shareToken = 'mock-token';
		component.shareAccount = { fullName: 'Sharer Name' } as any;

		component.requestShareAccess();
		tick();

		expect(apiService.share.requestShareAccess).toHaveBeenCalledWith(
			'mock-token',
		);

		expect(mockMessageService.showMessage).toHaveBeenCalledWith({
			message: 'Access requested. Sharer Name must approve your request.',
			style: 'success',
		});

		expect(component.showCover).toBe(false);
		expect(component.hasRequested).toBe(true);
	}));

	it('should show access granted message and navigate when status is not pending', fakeAsync(() => {
		const mockResponse = {
			getShareVO: () => ({ status: 'ok' }),
		};
		vi.spyOn(apiService.share, 'requestShareAccess').mockReturnValue(
			Promise.resolve(mockResponse as any),
		);
		const routerSpy = vi.spyOn(router, 'navigate');
		component.shareToken = 'mock-token';
		component.requestShareAccess();
		tick();

		expect(apiService.share.requestShareAccess).toHaveBeenCalledWith(
			'mock-token',
		);

		expect(mockMessageService.showMessage).toHaveBeenCalledWith({
			message: 'Access granted.',
			style: 'success',
		});

		expect(routerSpy).toHaveBeenCalledWith(['/app', 'shares']);
	}));
});
