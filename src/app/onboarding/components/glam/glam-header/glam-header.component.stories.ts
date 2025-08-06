import {
	applicationConfig,
	Meta,
	moduleMetadata,
	StoryObj,
} from '@storybook/angular';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GlamOnboardingHeaderComponent } from './glam-header.component';

const meta: Meta<GlamOnboardingHeaderComponent> = {
	title: 'GLAM Onboarding: Header',
	component: GlamOnboardingHeaderComponent,
	tags: ['glam', 'onboarding'],
	parameters: {
		backgrounds: {
			default: 'glam',
			values: [{ name: 'glam', value: '#131B4A' }],
		},
	},
	decorators: [
		moduleMetadata({
			imports: [FontAwesomeModule],
		}),
		applicationConfig({
			providers: [
				{
					provide: AccountService,
					useValue: { clear: () => {} },
				},
				{
					provide: Router,
					useValue: { navigate: async () => {} },
				},
			],
		}),
	],
};

export default meta;

export const Default: StoryObj<GlamOnboardingHeaderComponent> = {};
