import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

	beforeEach(async () => {
		feature = new FeatureFlagService(undefined, new SecretsService());
		calledAccept = false;
		acceptedArchive = null;

		await TestBed.configureTestingModule({
			declarations: [CreateNewArchiveComponent],
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

	it('the next button should be disabled if no goals have been selected', () => {
		component.screen = 'goals';
		component.selectedGoals = [];

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.goals-next');

		expect(button.disabled).toBe(true);
	});

	it('should show the reasons screen after selecting goals and then clicking next', () => {
		component.screen = 'goals';
		component.selectedGoals = ['goal 1', 'goal 2'];

		fixture.detectChanges();

		const goalsNextButton = fixture.nativeElement.querySelector('.goals-next');
		goalsNextButton.click();

		fixture.detectChanges();

		expect(component.screen).toBe('reasons'); // Expecting the overlay to be present
	});

	it('the create archive button should not work without any reasons selected', () => {
		component.screen = 'reasons';
		component.selectedReasons = [];

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.create-archive');

		expect(button.disabled).toBe(true);
	});

	it('should disable the Skip This Step and submit buttons when the archive has been submitted', () => {
		component.screen = 'reasons';
		component.isArchiveSubmitted = true;

		fixture.detectChanges();
		const submitButton = fixture.nativeElement.querySelector('.create-archive');

		const skipStepButton = fixture.nativeElement.querySelector('.skip-step');

		expect(submitButton.disabled).toBe(true);
		expect(skipStepButton.disabled).toBe(true);
	});

	it('should accept pending archives in the old flow', async () => {
		feature.set('glam-onboarding', false);
		component.pendingArchive = new ArchiveVO({ archiveId: 1234 });
		await component.onSubmit();

		expect(calledAccept).toBeTrue();
		expect(acceptedArchive.archiveId).toBe(1234);
	});

	it('should not accept pending archives in the glam flow (they are already accepted in an earlier step)', async () => {
		// Feature flag is read in constructor, so we must set isGlam directly
		component.isGlam = true;
		component.pendingArchive = new ArchiveVO({ archiveId: 1234 });
		await component.onSubmit();

		expect(calledAccept).toBeFalse();
		expect(acceptedArchive).toBeNull();
	});
});
