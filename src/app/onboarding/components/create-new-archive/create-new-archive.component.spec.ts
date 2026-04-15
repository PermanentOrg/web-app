import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ArchiveVO } from '@models/archive-vo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { EventService } from '@shared/services/event/event.service';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { OnboardingService } from '../../services/onboarding.service';
import { CreateNewArchiveComponent } from './create-new-archive.component';

import { vi } from 'vitest';

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
		updateAccountTags: vi.fn().mockResolvedValue(undefined),
	},
	share: {
		requestShareAccess: vi.fn().mockResolvedValue(undefined),
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
	let feature: FeatureFlagService;
	let onboardingService: OnboardingService;

	afterEach(() => {
		sessionStorage.clear();
	});

	beforeEach(async () => {
		feature = new FeatureFlagService(undefined, new SecretsService());
		calledAccept = false;
		acceptedArchive = null;
		mockApiService.share.requestShareAccess.mockClear();

		await TestBed.configureTestingModule({
			declarations: [CreateNewArchiveComponent],
			imports: [FormsModule],
			providers: [
				{ provide: ApiService, useValue: mockApiService },
				{ provide: AccountService, useValue: mockAccountService },
				EventService,
				OnboardingService,
				{ provide: FeatureFlagService, useValue: feature },
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
		vi.spyOn(component.progressUpdated, 'emit');

		// Recreate fixture to capture mount event
		const testFixture = TestBed.createComponent(CreateNewArchiveComponent);
		const testComponent = testFixture.componentInstance;
		vi.spyOn(testComponent.progressUpdated, 'emit');
		testFixture.detectChanges();

		expect(testComponent.progressUpdated.emit).toHaveBeenCalledWith(0);
	});

	it('the next button should be disabled if no goals have been selected', () => {
		component.screen = 'goals';
		component.selectedGoals = [];

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.goals-next');

		expect(button.disabled).toBe(true);
	});

	it('should show the reasons screen after selecting goals and then clicking next', () => {
		component.screen = 'goals';
		component.selectedGoals = ['goal 1', 'goal 2'];

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		const goalsNextButton = fixture.nativeElement.querySelector('.goals-next');
		goalsNextButton.click();

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		expect(component.screen).toBe('reasons'); // Expecting the overlay to be present
	});

	it('the create archive button should not work without any reasons selected', () => {
		component.screen = 'reasons';
		component.selectedReasons = [];

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.create-archive');

		expect(button.disabled).toBe(true);
	});

	it('should disable the Skip This Step and submit buttons when the archive has been submitted', () => {
		component.screen = 'reasons';
		component.isArchiveSubmitted = true;

		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const submitButton = fixture.nativeElement.querySelector('.create-archive');

		const skipStepButton = fixture.nativeElement.querySelector('.skip-step');

		expect(submitButton.disabled).toBe(true);
		expect(skipStepButton.disabled).toBe(true);
	});

	it('should accept pending archives in the old flow', async () => {
		feature.set('glam-onboarding', false);
		fixture.componentRef.setInput('pendingArchive', new ArchiveVO({ archiveId: 1234 }));
		await component.onSubmit();

		expect(calledAccept).toBe(true);
		expect(acceptedArchive.archiveId).toBe(1234);
	});

	it('should not accept pending archives in the glam flow (they are already accepted in an earlier step)', async () => {
		// Feature flag is read in constructor, so we must set isGlam directly
		component.isGlam = true;
		fixture.componentRef.setInput('pendingArchive', new ArchiveVO({ archiveId: 1234 }));
		await component.onSubmit();

		expect(calledAccept).toBe(false);
		expect(acceptedArchive).toBeNull();
	});

	it('should call requestShareAccess with shareToken from localStorage', async () => {
		vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
			if (key === 'shareToken') return 'test-share-token';
			return null;
		});

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).toHaveBeenCalledWith(
			'test-share-token',
		);
	});

	it('should call requestShareAccess with shareTokenFromCopy when shareToken is not present', async () => {
		vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
			if (key === 'shareTokenFromCopy') return 'test-share-token-from-copy';
			return null;
		});

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).toHaveBeenCalledWith(
			'test-share-token-from-copy',
		);
	});

	it('should prefer shareToken over shareTokenFromCopy when both are present', async () => {
		vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
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
		vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

		await component.onSubmit();

		expect(mockApiService.share.requestShareAccess).not.toHaveBeenCalled();
	});

	it('should not clear onboarding session storage when archive creation fails', async () => {
		vi.spyOn(onboardingService, 'clearOnboardingStorage');
		vi.spyOn(mockApiService.archive, 'create').mockRejectedValue(
			new Error('creation failed'),
		);

		await component.onSubmit();

		expect(onboardingService.clearOnboardingStorage).not.toHaveBeenCalled();
	});

	it('should clear onboarding session storage after archive creation', async () => {
		vi.spyOn(onboardingService, 'clearOnboardingStorage');

		await component.onSubmit();

		expect(onboardingService.clearOnboardingStorage).toHaveBeenCalled();
	});
});
