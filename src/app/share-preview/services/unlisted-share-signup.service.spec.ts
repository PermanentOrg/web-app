import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { AccountVO, ArchiveVO } from '@models';
import { OnboardingService } from '@onboarding/services/onboarding.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/archive.repo';
import { EventService } from '@shared/services/event/event.service';
import { UnlistedShareSignupDetails } from '../models/unlisted-share-signup-details';
import {
	HARDCODED_ACCOUNT_FULL_NAME,
	HARDCODED_ARCHIVE_NAME,
	HARDCODED_ARCHIVE_TYPE,
	HARDCODED_ONBOARDING_TAGS,
	UnlistedShareSignupService,
} from './unlisted-share-signup.service';

const SHARE_TOKEN = 'unlisted-share-token';

const SIGNUP_DETAILS: UnlistedShareSignupDetails = {
	email: 'jane@example.com',
	password: 'password123',
	agreedToTerms: true,
	receivesUpdatesViaEmail: false,
};

describe('UnlistedShareSignupService', () => {
	let service: UnlistedShareSignupService;
	let signedUpAccount: AccountVO;
	let createdArchive: ArchiveVO;
	let accountService: jasmine.SpyObj<AccountService>;
	let archiveApi: jasmine.SpyObj<ApiService['archive']>;
	let shareApi: jasmine.SpyObj<ApiService['share']>;
	let accountApi: jasmine.SpyObj<ApiService['account']>;
	let eventService: jasmine.SpyObj<EventService>;
	let onboardingService: jasmine.SpyObj<OnboardingService>;

	beforeEach(async () => {
		signedUpAccount = new AccountVO({ primaryEmail: SIGNUP_DETAILS.email });
		createdArchive = new ArchiveVO({
			archiveId: 42,
			fullName: HARDCODED_ARCHIVE_NAME,
		});

		accountService = jasmine.createSpyObj('AccountService', [
			'signUp',
			'logIn',
			'updateAccount',
			'setArchive',
		]);
		accountService.signUp.and.resolveTo(signedUpAccount);
		accountService.logIn.and.resolveTo();
		accountService.updateAccount.and.resolveTo();

		archiveApi = jasmine.createSpyObj('ArchiveRepo', ['create', 'change']);
		archiveApi.create.and.resolveTo({
			getArchiveVO: () => createdArchive,
		} as unknown as ArchiveResponse);
		archiveApi.change.and.resolveTo();

		shareApi = jasmine.createSpyObj('ShareRepo', ['requestShareAccess']);
		shareApi.requestShareAccess.and.resolveTo();

		accountApi = jasmine.createSpyObj('AccountRepo', ['updateAccountTags']);
		accountApi.updateAccountTags.and.resolveTo();

		eventService = jasmine.createSpyObj('EventService', ['dispatch']);
		onboardingService = jasmine.createSpyObj('OnboardingService', [
			'resetOnboardingState',
		]);

		await MockBuilder(UnlistedShareSignupService)
			.provide({ provide: AccountService, useValue: accountService })
			.provide({
				provide: ApiService,
				useValue: { archive: archiveApi, share: shareApi, account: accountApi },
			})
			.provide({ provide: EventService, useValue: eventService })
			.provide({ provide: OnboardingService, useValue: onboardingService });

		service = TestBed.inject(UnlistedShareSignupService);
	});

	it('should sign up with the typed details and a hardcoded name, without a default archive', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(onboardingService.resetOnboardingState).toHaveBeenCalled();
		expect(accountService.signUp).toHaveBeenCalledWith(
			SIGNUP_DETAILS.email,
			HARDCODED_ACCOUNT_FULL_NAME,
			SIGNUP_DETAILS.password,
			SIGNUP_DETAILS.password,
			true,
			false,
			null,
			'',
			false,
		);
	});

	it('should log in with the new credentials', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(accountService.logIn).toHaveBeenCalledWith(
			SIGNUP_DETAILS.email,
			SIGNUP_DETAILS.password,
			true,
			true,
		);
	});

	it('should send the same account events the onboarding flow sends', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		const dispatchedActions = eventService.dispatch.calls
			.allArgs()
			.map(([event]) => event.action);

		expect(dispatchedActions).toEqual([
			'create',
			'start_onboarding',
			'submit_goals',
			'submit_reasons',
		]);
	});

	it('should create a personal archive called "Permanent"', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		const [archiveToCreate] = archiveApi.create.calls.mostRecent()
			.args as ArchiveVO[];

		expect(archiveToCreate.fullName).toBe('Permanent');
		expect(archiveToCreate.type).toBe(HARDCODED_ARCHIVE_TYPE);
	});

	it('should add the unlisted share and save the hardcoded onboarding tags', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(shareApi.requestShareAccess).toHaveBeenCalledWith(SHARE_TOKEN);
		expect(accountApi.updateAccountTags).toHaveBeenCalledWith(
			HARDCODED_ONBOARDING_TAGS,
			[],
		);
	});

	it('should make the new archive the default and switch to it', async () => {
		const outcome = await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		const [accountChanges] = accountService.updateAccount.calls.mostRecent()
			.args as AccountVO[];

		expect(outcome).toBe('onboarded');
		expect(accountChanges.defaultArchiveId).toBe(createdArchive.archiveId);
		expect(accountService.setArchive).toHaveBeenCalledWith(createdArchive);
		expect(archiveApi.change).toHaveBeenCalledWith(createdArchive);
	});

	it('should make the calls in the same order as the onboarding flow', async () => {
		await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(accountService.signUp).toHaveBeenCalledBefore(accountService.logIn);
		expect(accountService.logIn).toHaveBeenCalledBefore(archiveApi.create);
		expect(archiveApi.create).toHaveBeenCalledBefore(
			shareApi.requestShareAccess,
		);

		expect(shareApi.requestShareAccess).toHaveBeenCalledBefore(
			accountApi.updateAccountTags,
		);

		expect(accountApi.updateAccountTags).toHaveBeenCalledBefore(
			accountService.updateAccount,
		);

		expect(accountService.updateAccount).toHaveBeenCalledBefore(
			accountService.setArchive,
		);

		expect(accountService.setArchive).toHaveBeenCalledBefore(archiveApi.change);
	});

	it('should stop after sign up when the account needs verification', async () => {
		signedUpAccount.status = 'status.auth.need_email';

		const outcome = await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(outcome).toBe('needs-verification');
		expect(accountService.logIn).not.toHaveBeenCalled();
		expect(archiveApi.create).not.toHaveBeenCalled();
	});

	it('should still finish onboarding when the share cannot be added', async () => {
		shareApi.requestShareAccess.and.rejectWith(new Error('share failed'));

		const outcome = await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(outcome).toBe('onboarded-without-share');
		expect(archiveApi.change).toHaveBeenCalledWith(createdArchive);
	});

	it('should ignore a failed tag update, like the onboarding flow does', async () => {
		accountApi.updateAccountTags.and.rejectWith(new Error('tags failed'));

		const outcome = await service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN);

		expect(outcome).toBe('onboarded');
		expect(archiveApi.change).toHaveBeenCalledWith(createdArchive);
	});

	it('should not create an archive when sign up fails', async () => {
		accountService.signUp.and.rejectWith({
			error: { message: 'warning.signup.email_taken' },
		});

		await expectAsync(
			service.signUpAndOnboard(SIGNUP_DETAILS, SHARE_TOKEN),
		).toBeRejected();

		expect(archiveApi.create).not.toHaveBeenCalled();
	});
});
