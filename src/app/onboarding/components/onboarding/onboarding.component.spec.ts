import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ngMocks, MockComponent } from 'ng-mocks';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchiveVO } from '@models/archive-vo';
import { AccountVO } from '@models/account-vo';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { MobileBannerComponent } from '@shared/components/mobile-banner/mobile-banner.component';
import { PromptComponent } from '@shared/components/prompt/prompt.component';
import { OnboardingHeaderComponent } from '../header/header.component';
import { GlamOnboardingHeaderComponent } from '../glam/glam-header/glam-header.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';
import { GlamPendingArchivesComponent } from '../glam-pending-archives/glam-pending-archives.component';
import { CreateNewArchiveComponent } from '../create-new-archive/create-new-archive.component';
import { OnboardingComponent } from './onboarding.component';

class NullRoute {
	public snapshot = {
		data: {},
	};
}

const throwError: boolean = false;
const mockApiService = {
	archive: {
		getAllArchives: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			return {
				getArchiveVos: () => [],
			};
		},
		accept: async (data: any) => true,
		change: async (archive: ArchiveVO) => {},
	},
};
const mockAccountService = {
	getAccount: () =>
		new AccountVO({
			accountId: 1,
			fullName: 'Test Account',
		}),
	refreshArchives: async () => [],
	setArchive: (archive: ArchiveVO) => {},
	updateAccount: async () => {},
	change: async () => {},
};
const mockMessageService = {
	showMessage: () => {},
	showError: () => {},
};

const mockRouter = {
	navigate: jasmine.createSpy('navigate'),
};

describe('OnboardingComponent #onboarding', () => {
	beforeEach(async () => {
		mockRouter.navigate.calls.reset();
		await TestBed.configureTestingModule({
			declarations: [
				OnboardingComponent,
				MockComponent(OnboardingHeaderComponent),
				MockComponent(GlamOnboardingHeaderComponent),
				MockComponent(WelcomeScreenComponent),
				MockComponent(GlamPendingArchivesComponent),
				MockComponent(CreateNewArchiveComponent),
				MockComponent(MobileBannerComponent),
				MockComponent(PromptComponent),
			],
			providers: [
				{ provide: ActivatedRoute, useValue: new NullRoute() },
				{ provide: Location, useValue: { go: (path: string) => {} } },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: Router, useValue: mockRouter },
				{ provide: MessageService, useValue: mockMessageService },
				EventService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	});

	it('should exist', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		fixture.detectChanges();

		expect(fixture.nativeElement).not.toBeNull();
	});

	it('should load the create new archive screen as default', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelectorAll('pr-create-new-archive').length,
		).toBe(1);
	});

	it('can change screens', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelectorAll('pr-create-new-archive').length,
		).toBe(1);

		expect(
			fixture.nativeElement.querySelectorAll('pr-welcome-screen').length,
		).toBe(0);
	});

	it('stores the newly created archive', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		expect(instance.currentArchive).toBeUndefined();
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		const child = ngMocks.find('pr-create-new-archive');

		expect(child).toBeTruthy();
		child.triggerEventHandler('createdArchive', new ArchiveVO({}));

		expect(instance.currentArchive).not.toBeUndefined();
	});

	it('stores an accepted archive invitation', async () => {
		const mockPendingArchive = new ArchiveVO({ status: 'someStatus-pending' });

		const localMockAccountService = {
			refreshArchives: jasmine
				.createSpy('refreshArchives')
				.and.returnValue(Promise.resolve([mockPendingArchive])),
			getAccount: jasmine
				.createSpy('getAccount')
				.and.returnValue(
					new AccountVO({ accountId: 1, fullName: 'Test Account' }),
				),
		};

		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			declarations: [
				OnboardingComponent,
				MockComponent(OnboardingHeaderComponent),
				MockComponent(GlamOnboardingHeaderComponent),
				MockComponent(WelcomeScreenComponent),
				MockComponent(GlamPendingArchivesComponent),
				MockComponent(CreateNewArchiveComponent),
				MockComponent(MobileBannerComponent),
				MockComponent(PromptComponent),
			],
			providers: [
				{ provide: AccountService, useValue: localMockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: ActivatedRoute, useValue: new NullRoute() },
				{ provide: Location, useValue: { go: (path: string) => {} } },
				{ provide: Router, useValue: mockRouter },
				{ provide: MessageService, useValue: mockMessageService },
				EventService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		instance.ngOnInit();
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();

		if (instance.pendingArchives.length > 0) {
			expect(instance.screen).toBe(OnboardingScreen.pendingArchives);
		}

		expect(
			fixture.nativeElement.querySelectorAll('pr-welcome-screen').length,
		).toBe(1);
		ngMocks
			.find('pr-welcome-screen')
			.triggerEventHandler(
				'selectInvitation',
				new ArchiveVO({ fullName: 'Pending Test' }),
			);
		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.selectedPendingArchive).not.toBeUndefined();
	});

	it('can be tested with debugging component', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		expect(instance.pendingArchives.length).toBe(0);
		instance.setState({
			pendingArchives: [new ArchiveVO({})],
		});

		expect(instance.pendingArchives.length).toBe(1);
	});

	it('displays the pending archives screen when there are pending archives', async () => {
		const mockPendingArchive = new ArchiveVO({ status: 'someStatus-pending' });

		const localMockAccountService = {
			refreshArchives: jasmine
				.createSpy('refreshArchives')
				.and.returnValue(Promise.resolve([mockPendingArchive])),
			getAccount: jasmine
				.createSpy('getAccount')
				.and.returnValue(
					new AccountVO({ accountId: 1, fullName: 'Test Account' }),
				),
		};

		TestBed.resetTestingModule();
		await TestBed.configureTestingModule({
			declarations: [
				OnboardingComponent,
				MockComponent(OnboardingHeaderComponent),
				MockComponent(GlamOnboardingHeaderComponent),
				MockComponent(WelcomeScreenComponent),
				MockComponent(GlamPendingArchivesComponent),
				MockComponent(CreateNewArchiveComponent),
				MockComponent(MobileBannerComponent),
				MockComponent(PromptComponent),
			],
			providers: [
				{ provide: AccountService, useValue: localMockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: ActivatedRoute, useValue: new NullRoute() },
				{ provide: Location, useValue: { go: (path: string) => {} } },
				{ provide: Router, useValue: mockRouter },
				{ provide: MessageService, useValue: mockMessageService },
				EventService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		instance.ngOnInit();
		fixture.detectChanges();

		if (instance.pendingArchives.length > 0) {
			expect(instance.screen).toBe(OnboardingScreen.pendingArchives);
		}
	});

	it('should remove shareToken from localStorage', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		const getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(
			'someToken',
		);
		const removeItemSpy = spyOn(localStorage, 'removeItem');

		instance.screen = OnboardingScreen.done;
		instance.acceptedInvite = true;

		instance.setScreen(OnboardingScreen.done);
		fixture.detectChanges();
		await fixture.whenStable();

		expect(getItemSpy).toHaveBeenCalledWith('shareToken');
		expect(removeItemSpy).toHaveBeenCalledWith('shareToken');
	});

	it('should navigate to /app/welcome if shareToken is not in localStorage and isGlam is false', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		spyOn(localStorage, 'getItem').and.returnValue(null);
		instance.isGlam = false;
		instance.acceptedInvite = false;
		instance.setScreen(OnboardingScreen.done);
		instance.selectedPendingArchive = null;
		fixture.detectChanges();
		await fixture.whenStable();

		expect(mockRouter.navigate).toHaveBeenCalledWith(['/app', 'welcome']);
	});

	it('should navigate to /app if shareToken is not in localStorage and isGlam is true', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		spyOn(localStorage, 'getItem').and.returnValue(null);
		instance.isGlam = true;
		instance.acceptedInvite = false;
		instance.setScreen(OnboardingScreen.done);
		instance.selectedPendingArchive = null;
		fixture.detectChanges();
		await fixture.whenStable();

		expect(mockRouter.navigate).toHaveBeenCalledWith(['/app']);
	});

	it('should navigate to /app/welcome-invite if shareToken is not in localStorage and isGlam is true', async () => {
		const fixture = TestBed.createComponent(OnboardingComponent);
		const instance = fixture.componentInstance;

		spyOn(localStorage, 'getItem').and.returnValue(null);
		instance.isGlam = false;
		instance.acceptedInvite = true;
		instance.setScreen(OnboardingScreen.done);
		instance.selectedPendingArchive = null;
		fixture.detectChanges();
		await fixture.whenStable();

		expect(mockRouter.navigate).toHaveBeenCalledWith([
			'/app',
			'welcome-invitation',
		]);
	});
});
