/* @format */
import {
	applicationConfig,
	Meta,
	moduleMetadata,
	StoryObj,
} from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVO } from '@models/account-vo';
import { ArchiveVO } from '@models/index';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ComponentsModule } from '@root/app/component-library/components.module';
import { AccessRolePipe } from '@shared/pipes/access-role.pipe';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { FeatureFlagApi } from '@root/app/feature-flag/types/feature-flag-api';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';
import { CreateNewArchiveComponent } from '../create-new-archive/create-new-archive.component';
import { ArchiveTypeSelectComponent } from '../archive-type-select/archive-type-select.component';
import { ArchiveCreationStartScreenComponent } from '../glam/archive-creation-start-screen/archive-creation-start-screen.component';
import { SelectArchiveTypeScreenComponent } from '../glam/select-archive-type-screen/select-archive-type-screen.component';
import { NameArchiveScreenComponent } from '../glam/name-archive-screen/name-archive-screen.component';
import { CreateArchiveForMeScreenComponent } from '../glam/create-archive-for-me-screen/create-archive-for-me-screen.component';
import { FinalizeArchiveCreationScreenComponent } from '../glam/finalize-archive-creation-screen/finalize-archive-creation-screen.component';
import { GlamReasonsScreenComponent } from '../glam/glam-reasons-screen/glam-reasons-screen.component';
import { GlamGoalsScreenComponent } from '../glam/glam-goals-screen/glam-goals-screen.component';
import { GlamUserSurveySquareComponent } from '../glam/glam-user-survey-square/glam-user-survey-square.component';
import { OnboardingHeaderComponent } from '../header/header.component';
import { GlamOnboardingHeaderComponent } from '../glam/glam-header/glam-header.component';
import { GlamArchiveTypeSelectComponent } from '../glam/archive-type-select/archive-type-select.component';
import { ArchiveTypeIconComponent } from '../glam/archive-type-icon/archive-type-icon.component';
import { GlamPendingArchivesComponent } from '../glam-pending-archives/glam-pending-archives.component';
import { PendingArchiveComponent } from '../glam/pending-archive/pending-archive.component';
import { ArchiveCreationWithShareComponent } from '../archive-creation-with-share/archive-creation-with-share.component';
import { OnboardingService } from '../../services/onboarding.service';
import { OnboardingComponent } from './onboarding.component';

class MockAccountService {
	public static accountName = 'Test User';
	public static pendingInivitations = false;

	public static resetStatics(): void {
		MockAccountService.accountName = 'Test User';
		MockAccountService.pendingInivitations = false;
	}

	public getAccount(): AccountVO {
		return new AccountVO({ fullName: MockAccountService.accountName });
	}

	public async updateAccount(changes: AccountVO): Promise<void> {
		action('Current Account Update')(changes);
	}

	public getArchive() {
		return undefined;
	}

	public setArchive = action('Set Current Archive');

	public async refreshArchives(): Promise<ArchiveVO[]> {
		const archiveTemplate = {
			fullName: 'Pending Invitation',
			type: 'type.archive.person',
			status: 'status.generic.pending',
			thumbURL200: '/assets/icon/android-chrome-512x512.png',
		};
		if (MockAccountService.pendingInivitations) {
			return [
				'access.role.viewer',
				'access.role.contributor',
				'access.role.editor',
				'access.role.curator',
				'access.role.manager',
				'access.role.owner',
			].map(
				(accessRole, index) =>
					new ArchiveVO({
						archiveId: 10 + index,
						accessRole,
						...archiveTemplate,
					}),
			);
		} else {
			return [];
		}
	}

	public createAccountForMe = new Subject<void>();
}

class MockApiService {
	public invite = {
		getFullShareInvite: async (token: string) => {
			action('Get Full Share Invite')(token);
			return {
				getInviteVO: () => ({
					AccountVO: {
						fullName: 'John Doe',
					},
					ArchiveVO: {
						fullName: 'Family Photos',
					},
				}),
			};
		},
	};

	public account = {
		updateAccountTags: async (tags: string[]) => {
			action('Mailchimp Tag')(tags);
		},
	};

	public archive = {
		accept: async (archive: ArchiveVO) => {
			action('Accepted Invitation')(archive);
		},

		create: async (archive: ArchiveVO | ArchiveVO[]) => {
			action('Created Archive')(archive);
			return { getArchiveVO: () => ({ ...archive, archiveId: 0 }) };
		},

		change: async (archive: ArchiveVO) => {
			action('Changed PHP Session Archive')(archive);
		},
	};
}

class StaticFeatureFlagService extends FeatureFlagService {
	public static Features: string[] = [];

	constructor() {
		super(
			{} as FeatureFlagApi,
			{
				get() {
					throw false;
				},
			} as unknown as SecretsService,
		);
		StaticFeatureFlagService.Features.forEach((flag) => {
			this.set(flag, true);
		});
	}
}

export default {
	title: 'Onboarding Demo',
	component: OnboardingComponent,
	tags: ['onboarding', 'demo'],
	argTypes: {
		accountName: {
			control: { type: 'text' },
			defaultValue: 'Test User',
			name: 'Account Name',
			description: "The test account's full name",
		},
		hasInvitations: {
			control: { type: 'boolean' },
			name: 'Test Pending Archive Invitations',
			defaultValue: false,
			description: 'Enables the "Pending Archives" onboarding flow.',
		},
		isGlam: {
			control: { type: 'boolean' },
			name: 'Enable GLAM design',
			defaultValue: false,
			description: 'Use the GLAM onboarding flow.',
		},
		shareToken: {
			control: { type: 'boolean' },
			name: 'Has Share Token',
			defaultValue: false,
			description: 'Enables the "Share Token" onboarding flow.',
		},
	},
	decorators: [
		moduleMetadata({
			declarations: [
				OnboardingComponent,
				WelcomeScreenComponent,
				CreateNewArchiveComponent,
				ArchiveTypeSelectComponent,
				ArchiveCreationStartScreenComponent,
				SelectArchiveTypeScreenComponent,
				NameArchiveScreenComponent,
				CreateArchiveForMeScreenComponent,
				FinalizeArchiveCreationScreenComponent,
				GlamReasonsScreenComponent,
				GlamGoalsScreenComponent,
				GlamUserSurveySquareComponent,
				OnboardingHeaderComponent,
				GlamOnboardingHeaderComponent,
				ArchiveSmallComponent,
				BgImageSrcDirective,
				GlamPendingArchivesComponent,
				PendingArchiveComponent,
				ArchiveCreationWithShareComponent,
				AccessRolePipe,
			],
			imports: [
				CommonModule,
				FormsModule,
				FontAwesomeModule,
				ComponentsModule,
				GlamArchiveTypeSelectComponent,
				ArchiveTypeIconComponent,
			],
			providers: [
				{ provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
				{ provide: AccountService, useClass: MockAccountService },
				{ provide: ApiService, useClass: MockApiService },
				OnboardingService,
				{ provide: FeatureFlagService, useClass: StaticFeatureFlagService },
			],
		}),
	],
};

type Story = StoryObj;
interface StoryArgs {
	accountName?: string;
	hasInvitations?: boolean;
	isGlam?: boolean;
	shareToken?: boolean;
}
const StoryTemplate: (a: StoryArgs) => Story = (args: StoryArgs) => {
	sessionStorage.clear();
	MockAccountService.resetStatics();
	if (args.accountName) {
		MockAccountService.accountName = args.accountName;
	}
	if (args.hasInvitations) {
		MockAccountService.pendingInivitations = args.hasInvitations;
	}
	if (args.isGlam) {
		StaticFeatureFlagService.Features = ['glam-onboarding'];
	} else {
		StaticFeatureFlagService.Features = [];
	}

	if (args.shareToken) {
		localStorage.setItem('shareToken', 'token');
	} else {
		localStorage.removeItem('shareToken');
	}
	return {
		render: () => {
			return {};
		},
		moduleMetadata: {
			providers: [
				{
					provide: '__force_rerender_on_propschange__',
					useValue: JSON.stringify(args),
				},
			],
		},
	};
};
export const Default: Story = StoryTemplate.bind({});
Default.args = {
	accountName: 'Test User',
	hasInvitations: false,
	isGlam: false,
};

export const ArchiveInvitations: Story = StoryTemplate.bind({});
ArchiveInvitations.args = {
	accountName: 'Test User',
	hasInvitations: true,
	isGlam: false,
};

export const Glam: Story = StoryTemplate.bind({});
Glam.args = {
	accountName: 'Test User',
	hasInvitations: false,
	isGlam: true,
};

export const GlamShareInvite: Story = StoryTemplate.bind({});
GlamShareInvite.args = {
	accountName: 'Test User',
	isGlam: true,
	shareToken: true,
	hasInvitations: false,
};
