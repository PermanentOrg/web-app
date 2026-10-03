import {
	fakeAsync,
	ComponentFixture,
	TestBed,
	TestModuleMetadata,
	tick,
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import {
	Router,
	ActivatedRoute,
	ActivatedRouteSnapshot,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cloneDeep } from 'lodash';

import { SharedModule } from '@shared/shared.module';
import { ComponentsModule } from '@root/app/component-library/components.module';
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
import { AccountService } from '@shared/services/account/account.service';
import { CreateAccountDialogComponent } from '../create-account-dialog/create-account-dialog.component';
import { UnlistedShareSignupFooterComponent } from '../unlisted-share-signup-footer/unlisted-share-signup-footer.component';
import { UnlistedShareSignupService } from '../../services/unlisted-share-signup.service';
import { SharePreviewComponent } from './share-preview.component';

export const mockAccountService = jasmine.createSpyObj('AccountService', [
	'getAccount',
	'getArchive',
	'isLoggedIn',
	'signUp',
	'logIn',
	'refreshArchives',
	'getArchives',
	'changeArchive',
	'promptForArchiveChange',
	'setRedirect',
]);

// Provide default return values
const defaultAccount = new AccountVO({ primaryEmail: 'test@example.com' });
const defaultArchive = new ArchiveVO({ archiveId: 123 });

const mockGoogleAnalyticsService = {
	sendEvent: jasmine.createSpy(),
};

mockAccountService.getAccount.and.returnValue(defaultAccount);
mockAccountService.getArchive.and.returnValue(defaultArchive);
mockAccountService.isLoggedIn.and.returnValue(true);
mockAccountService.signUp.and.returnValue(Promise.resolve(defaultAccount));

const authResponse = new AuthResponse({});
authResponse.needsMFA = () => false;
mockAccountService.logIn.and.returnValue(Promise.resolve(authResponse));

mockAccountService.refreshArchives.and.returnValue(Promise.resolve());
mockAccountService.getArchives.and.returnValue([defaultArchive]);
mockAccountService.changeArchive.and.returnValue(Promise.resolve());
mockAccountService.promptForArchiveChange.and.returnValue(Promise.resolve());
mockAccountService.setRedirect.and.stub();

// Subjects for subscriptions
mockAccountService.archiveChange = new Subject<ArchiveVO>();
mockAccountService.accountChange = new Subject<AccountVO>();

const mockShareLinksService = {
	currentShareToken: null,
	isUnlistedShare: () => true,
};

const mockFilesystemService = {
	getFolder: jasmine.createSpy().and.returnValue(Promise.resolve({})),
};

const mockMessageService = {
	showMessage: jasmine.createSpy(),
	showError: jasmine.createSpy(),
};

const mockUnlistedShareSignupService = jasmine.createSpyObj(
	'UnlistedShareSignupService',
	['signUpAndOnboard'],
);

describe('SharePreviewComponent', () => {
	let component: SharePreviewComponent;
	let fixture: ComponentFixture<SharePreviewComponent>;
	let dialog: DialogCdkService;
	let router: Router;
	let apiService: ApiService;

	beforeEach(async () => {
		const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(
			SharedModule,
			RouterTestingModule,
			ComponentsModule,
			UnlistedShareSignupFooterComponent,
		);
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
		spyOnProperty(mockRoute.snapshot, 'firstChild', 'get').and.returnValue(
			firstChild,
		);

		const parent = new ActivatedRoute();
		spyOnProperty(mockRoute, 'parent', 'get').and.returnValue(parent);

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

		config.providers.push({
			provide: UnlistedShareSignupService,
			useValue: mockUnlistedShareSignupService,
		});

		await TestBed.configureTestingModule(config).compileComponents();

		dialog = TestBed.inject(DialogCdkService);
		router = TestBed.inject(Router);
		apiService = TestBed.inject(ApiService);
		spyOn(router, 'navigate');

		fixture = TestBed.createComponent(SharePreviewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should mark it as unlisted share if restrictions are none', fakeAsync(() => {
		spyOn(mockShareLinksService, 'isUnlistedShare').and.returnValue(true);
		component.ngOnInit();

		expect(mockShareLinksService.isUnlistedShare).toHaveBeenCalled();
		tick(1005);

		expect(component.isUnlistedShare).toEqual(true);
	}));

	it('should open dialog shortly after loading if user is logged out and it is not an unlisted share', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		component.isLoggedIn = false;
		component.isUnlistedShare = false;
		component.showCreateAccountDialog();
		tick(1005);

		expect(dialogSpy).toHaveBeenCalledWith(CreateAccountDialogComponent, {
			data: { sharerName: 'Sharer Name' },
		});
	}));

	it('should not open dialog if user is logged out, but it is an unlisted share', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		component.isLoggedIn = false;
		component.isUnlistedShare = true;
		component.ngOnInit();
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog if user is logged in and it is not an unlisted share', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

		component.isLoggedIn = true;
		component.isUnlistedShare = false;
		component.ngOnInit();
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	it('should not open dialog shortly after loading if user is logged in and share is unlisted', fakeAsync(() => {
		const dialogSpy = spyOn(dialog, 'open');
		component.isLoggedIn = true;
		component.isUnlistedShare = true;
		tick(1005);

		expect(dialogSpy).not.toHaveBeenCalled();
	}));

	describe('unlisted share signup footer', () => {
		const signupFooterElement = (): HTMLElement =>
			fixture.nativeElement.querySelector('pr-unlisted-share-signup-footer');

		const loadShare = ({
			isLoggedIn,
			isUnlistedShare,
		}: {
			isLoggedIn: boolean;
			isUnlistedShare: boolean;
		}): void => {
			spyOn(TestBed.inject(AccountService), 'isLoggedIn').and.returnValue(
				isLoggedIn,
			);
			spyOn(mockShareLinksService, 'isUnlistedShare').and.returnValue(
				isUnlistedShare,
			);
			mockFilesystemService.getFolder.and.callFake(async () => ({}));
			spyOn(dialog, 'open').and.returnValue(
				jasmine.createSpyObj('DialogRef', ['close']),
			);
			component.ngOnInit();
			tick();
		};

		it('should show the footer two seconds after a logged out user loads an unlisted share', fakeAsync(() => {
			loadShare({ isLoggedIn: false, isUnlistedShare: true });
			tick(1999);
			fixture.detectChanges();

			expect(signupFooterElement()).toBeNull();

			tick(1);
			fixture.detectChanges();

			expect(signupFooterElement()).not.toBeNull();
		}));

		it('should hide the footer once it is closed', fakeAsync(() => {
			loadShare({ isLoggedIn: false, isUnlistedShare: true });
			tick(2000);
			fixture.detectChanges();

			component.hideUnlistedShareSignupFooter();
			fixture.detectChanges();

			expect(signupFooterElement()).toBeNull();
		}));

		it('should not show the footer to a logged in user', fakeAsync(() => {
			loadShare({ isLoggedIn: true, isUnlistedShare: true });
			tick(2000);
			fixture.detectChanges();

			expect(signupFooterElement()).toBeNull();
		}));

		it('should not show the footer on a share that is not unlisted', fakeAsync(() => {
			loadShare({ isLoggedIn: false, isUnlistedShare: false });
			tick(2000);
			fixture.detectChanges();

			expect(signupFooterElement()).toBeNull();
		}));

		it('should not show the footer after the share has been left', fakeAsync(() => {
			loadShare({ isLoggedIn: false, isUnlistedShare: true });
			component.ngOnDestroy();
			tick(2000);

			expect(component.isUnlistedShareSignupFooterVisible).toBeFalse();
		}));
	});

	describe('when the unlisted share signup footer is submitted', () => {
		const signupDetails = {
			email: 'jane@example.com',
			password: 'password123',
			agreedToTerms: true,
			receivesUpdatesViaEmail: false,
		};

		beforeEach(() => {
			mockMessageService.showMessage.calls.reset();
			mockMessageService.showError.calls.reset();
		});

		it('should sign up and onboard with the current share token', async () => {
			mockUnlistedShareSignupService.signUpAndOnboard.and.resolveTo(
				'onboarded',
			);

			await component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(
				mockUnlistedShareSignupService.signUpAndOnboard,
			).toHaveBeenCalledWith(signupDetails, 'test');
		});

		it('should land the new user on the shared workspace', async () => {
			mockUnlistedShareSignupService.signUpAndOnboard.and.resolveTo(
				'onboarded',
			);

			await component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(router.navigate).toHaveBeenCalledWith(['/app', 'shares']);
			expect(mockMessageService.showError).not.toHaveBeenCalled();
		});

		it('should show the loading layover until the flow finishes', async () => {
			let finishSignup: (outcome: string) => void;
			mockUnlistedShareSignupService.signUpAndOnboard.and.returnValue(
				new Promise((resolve) => {
					finishSignup = resolve;
				}),
			);

			const submission =
				component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(component.isSubmittingUnlistedShareSignup).toBeTrue();

			fixture.detectChanges();

			expect(
				fixture.nativeElement.querySelector(
					'pr-loading-spinner.unlisted-share-signup-loading',
				),
			).not.toBeNull();

			finishSignup('onboarded');
			await submission;
			fixture.detectChanges();

			expect(component.isSubmittingUnlistedShareSignup).toBeFalse();
			expect(
				fixture.nativeElement.querySelector(
					'pr-loading-spinner.unlisted-share-signup-loading',
				),
			).toBeNull();
		});

		it('should still land on the shared workspace, with a warning, when the share could not be added', async () => {
			mockUnlistedShareSignupService.signUpAndOnboard.and.resolveTo(
				'onboarded-without-share',
			);

			await component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(mockMessageService.showError).toHaveBeenCalled();
			expect(router.navigate).toHaveBeenCalledWith(['/app', 'shares']);
		});

		it('should send the user to verify their account when sign up needs it', async () => {
			mockUnlistedShareSignupService.signUpAndOnboard.and.resolveTo(
				'needs-verification',
			);

			await component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(router.navigate).toHaveBeenCalledWith(['/app', 'auth', 'verify']);
			expect(router.navigate).not.toHaveBeenCalledWith(['/app', 'shares']);
		});

		it('should show the API error and stay on the share when sign up fails', async () => {
			mockUnlistedShareSignupService.signUpAndOnboard.and.rejectWith({
				error: { message: 'warning.signup.email_taken' },
			});

			await component.onUnlistedShareSignupSubmitted(signupDetails);

			expect(mockMessageService.showError).toHaveBeenCalledWith({
				message: 'warning.signup.email_taken',
				translate: true,
			});

			expect(router.navigate).not.toHaveBeenCalledWith(['/app', 'shares']);
			expect(component.isSubmittingUnlistedShareSignup).toBeFalse();
		});
	});

	it('should not open dialog if already open', () => {
		const dialogSpy = spyOn(dialog, 'open');
		component.createAccountDialogIsOpen = true;

		component.showCreateAccountDialog();

		expect(dialogSpy).not.toHaveBeenCalled();
	});

	it('should open dialog when a thumbnail is clicked', fakeAsync(() => {
		const dialogRefSpy = jasmine.createSpyObj('DialogRef', ['close']);
		const dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpy);

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
		const unsubscribeSpy = spyOn(
			component.fileListClickListener,
			'unsubscribe',
		);
		component.unsubscribeFromItemClicks();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});

	it('should toggle cover visibility', () => {
		component.showCover = false;
		component.toggleCover();

		expect(component.showCover).toBeTrue();

		component.toggleCover();

		expect(component.showCover).toBeFalse();
	});

	it('should stop event propagation', () => {
		const event = jasmine.createSpyObj('Event', ['stopPropagation']);
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
		spyOn(apiService.share, 'checkShareLink').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getShareByUrlVO: () => mockVO,
			} as unknown as ShareResponse),
		);

		spyOn(component, 'checkAccess');

		component.reloadSharePreviewData();
		tick(1005);

		expect(apiService.share.checkShareLink).toHaveBeenCalled();
		expect(component.sharePreviewVO).toEqual(mockVO);
		expect(component.checkAccess).toHaveBeenCalled();
	}));

	it('should reload share preview data for relationship share', fakeAsync(() => {
		const mockVO = { ShareVO: { status: 'ok', accessRole: 'owner' } };
		spyOn(apiService.share, 'getShareForPreview').and.returnValue(
			Promise.resolve({
				getShareVO: () => mockVO,
			} as unknown as ShareResponse),
		);
		component.isLinkShare = false;
		component.isRelationshipShare = true;

		spyOn(component, 'checkAccess');

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

		expect(component.hasRequested).toBeTrue();
		expect(component.showCover).toBeFalse();
	}));

	it('should request access and show pending message when status is pending', fakeAsync(() => {
		const mockResponse = {
			getShareVO: () => ({ status: 'status.generic.pending' }),
		};
		spyOn(apiService.share, 'requestShareAccess').and.returnValue(
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

		expect(component.showCover).toBeFalse();
		expect(component.hasRequested).toBeTrue();
	}));

	it('should show access granted message and navigate when status is not pending', fakeAsync(() => {
		const mockResponse = {
			getShareVO: () => ({ status: 'ok' }),
		};
		spyOn(apiService.share, 'requestShareAccess').and.returnValue(
			Promise.resolve(mockResponse as any),
		);
		const routerSpy = spyOn(router, 'navigate');
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
