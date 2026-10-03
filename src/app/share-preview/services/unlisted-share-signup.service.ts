import { Injectable } from '@angular/core';
import { AccountVO, ArchiveVO } from '@models';
import { ArchiveType } from '@models/archive-vo';
import { OnboardingService } from '@onboarding/services/onboarding.service';
import {
	OnboardingGoalsTags,
	OnboardingReasonsTags,
	OnboardingTypes,
} from '@onboarding/shared/onboarding-screen';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { EventService } from '@shared/services/event/event.service';
import { UnlistedShareSignupDetails } from '../models/unlisted-share-signup-details';

export const HARDCODED_ACCOUNT_FULL_NAME = 'Permanent User';
export const HARDCODED_ARCHIVE_NAME = 'Permanent';
export const HARDCODED_ARCHIVE_TYPE: ArchiveType = 'type.archive.person';
export const HARDCODED_ONBOARDING_TAGS: string[] = [
	OnboardingTypes.myself,
	OnboardingGoalsTags.share,
	OnboardingReasonsTags.collaborate,
];

export type UnlistedShareSignupOutcome =
	| 'onboarded'
	| 'onboarded-without-share'
	| 'needs-verification';

@Injectable({
	providedIn: 'root',
})
export class UnlistedShareSignupService {
	constructor(
		private accountService: AccountService,
		private api: ApiService,
		private event: EventService,
		private onboardingService: OnboardingService,
	) {}

	/**
	 * Creates the account, then walks through the same calls the onboarding
	 * flow makes, using hardcoded answers for everything the footer doesn't ask.
	 */
	public async signUpAndOnboard(
		signupDetails: UnlistedShareSignupDetails,
		shareToken: string,
	): Promise<UnlistedShareSignupOutcome> {
		this.onboardingService.resetOnboardingState();

		const account = await this.createAccount(signupDetails);
		if (account.needsVerification()) {
			return 'needs-verification';
		}

		await this.accountService.logIn(
			signupDetails.email,
			signupDetails.password,
			true,
			true,
		);
		this.dispatchOnboardingEvents();

		const archive = await this.createArchive();
		const isShareAdded = await this.addShareToArchive(shareToken);
		await this.saveOnboardingTags();
		await this.makeDefaultArchive(archive);

		return isShareAdded ? 'onboarded' : 'onboarded-without-share';
	}

	private async createAccount(
		signupDetails: UnlistedShareSignupDetails,
	): Promise<AccountVO> {
		return await this.accountService.signUp(
			signupDetails.email,
			HARDCODED_ACCOUNT_FULL_NAME,
			signupDetails.password,
			signupDetails.password,
			signupDetails.agreedToTerms,
			signupDetails.receivesUpdatesViaEmail,
			null,
			'',
			false,
		);
	}

	private dispatchOnboardingEvents(): void {
		const onboardingActions = [
			'create',
			'start_onboarding',
			'submit_goals',
			'submit_reasons',
		] as const;
		onboardingActions.forEach((action) =>
			this.event.dispatch({ entity: 'account', action }),
		);
	}

	private async createArchive(): Promise<ArchiveVO> {
		const response = await this.api.archive.create(
			new ArchiveVO({
				fullName: HARDCODED_ARCHIVE_NAME,
				type: HARDCODED_ARCHIVE_TYPE,
			}),
		);
		return response.getArchiveVO();
	}

	private async addShareToArchive(shareToken: string): Promise<boolean> {
		try {
			await this.api.share.requestShareAccess(shareToken);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Onboarding ignores a failed tag update, since the tags only feed
	 * analytics and shouldn't block account creation.
	 */
	private async saveOnboardingTags(): Promise<void> {
		try {
			await this.api.account.updateAccountTags(HARDCODED_ONBOARDING_TAGS, []);
		} catch {}
	}

	private async makeDefaultArchive(archive: ArchiveVO): Promise<void> {
		await this.accountService.updateAccount(
			new AccountVO({ defaultArchiveId: archive.archiveId }),
		);
		this.accountService.setArchive(archive);
		await this.api.archive.change(archive);
	}
}
