import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { EventService } from '@shared/services/event/event.service';
import { OnboardingService } from '../../services/onboarding.service';
import { CreateNewArchiveComponent } from './create-new-archive.component';

let calledAccept: boolean = false;
let acceptedArchive: ArchiveVO | undefined;
const mockApiService = {
	archive: {
		create: async (a: ArchiveVO) => ({
			getArchiveVO: () => a,
		}),
		accept: async (a: ArchiveVO) => {
			calledAccept = true;
			acceptedArchive = a;
			return {
				getArchiveVO: () => a,
			};
		},
	},
	account: {
		updateAccountTags: jasmine.createSpy('updateAccountTags').and.resolveTo(),
	},
	share: {
		requestShareAccess: jasmine.createSpy('requestShareAccess').and.resolveTo(),
	},
};

const mockAccountService = {
	getAccount: () => new AccountVO({ accountId: 1 }),
	createAccountForMe: new BehaviorSubject<{ name: string; action: string }>({
		name: '',
		action: '',
	}),
};

describe('CreateNewArchiveComponent #onboarding', () => {
	let component: CreateNewArchiveComponent;
	let fixture: ComponentFixture<CreateNewArchiveComponent>;
	let onboardingService: OnboardingService;

	afterEach(() => {
		sessionStorage.clear();
	});

	beforeEach(async () => {
		calledAccept = false;
		acceptedArchive = null;
		mockApiService.share.requestShareAccess.calls.reset();

		await TestBed.configureTestingModule({
			declarations: [CreateNewArchiveComponent],
			providers: [
				{ provide: ApiService, useValue: mockApiService },
				{ provide: AccountService, useValue: mockAccountService },
				EventService,
				OnboardingService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateNewArchiveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		onboardingService = TestBed.inject(OnboardingService);
	});

	it('should exist', () => {
		expect(fixture.nativeElement).not.toBeNull();
	});

	it('should emit a progress bar change event on mount', () => {
		spyOn(component.progressUpdated, 'emit');

		// Recreate fixture to capture mount event
		const testFixture = TestBed.createComponent(CreateNewArchiveComponent);
		const testComponent = testFixture.componentInstance;
		spyOn(testComponent.progressUpdated, 'emit');
		testFixture.detectChanges();

		expect(testComponent.progressUpdated.emit).toHaveBeenCalledWith(0);
	});

	it('should not accept pending archives (they are already accepted in an earlier step)', async () => {
		component.pendingArchive = new ArchiveVO({ archiveId: 1234 });
		await component.onSubmit();

		expect(calledAccept).toBeFalse();
		expect(acceptedArchive).toBeNull();
	});

	it('should call requestShareAccess with shareToken from localStorage', async () => {
		spyOn(localStorage, 'getItem').and.callFake((key: string) => {
			if (key === 'shareToken') return 'test-share-token';
			return null;
		});

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).toHaveBeenCalledWith(
			'test-share-token',
		);
	});

	it('should call requestShareAccess with shareTokenFromCopy when shareToken is not present', async () => {
		spyOn(localStorage, 'getItem').and.callFake((key: string) => {
			if (key === 'shareTokenFromCopy') return 'test-share-token-from-copy';
			return null;
		});

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).toHaveBeenCalledWith(
			'test-share-token-from-copy',
		);
	});

	it('should prefer shareToken over shareTokenFromCopy when both are present', async () => {
		spyOn(localStorage, 'getItem').and.callFake((key: string) => {
			if (key === 'shareToken') return 'primary-token';
			if (key === 'shareTokenFromCopy') return 'secondary-token';
			return null;
		});

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).toHaveBeenCalledWith(
			'primary-token',
		);
	});

	it('should not call requestShareAccess when no share token exists in localStorage', async () => {
		spyOn(localStorage, 'getItem').and.returnValue(null);

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).not.toHaveBeenCalled();
	});

	it('should not clear onboarding session storage when archive creation fails', async () => {
		spyOn(onboardingService, 'clearSessionStorage');
		spyOn(mockApiService.archive, 'create').and.rejectWith(
			new Error('creation failed'),
		);

		await component.onSubmit();

		expect(onboardingService.clearSessionStorage).not.toHaveBeenCalled();
	});

	it('should clear onboarding session storage after archive creation', async () => {
		spyOn(onboardingService, 'clearSessionStorage');

		await component.onSubmit();

		expect(onboardingService.clearSessionStorage).toHaveBeenCalled();
	});
});
