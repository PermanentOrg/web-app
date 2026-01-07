import { Meta, moduleMetadata } from '@storybook/angular';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';
import { DirectiveModule } from '../../directive.module';
import { DirectiveDisplayComponent } from './directive-display.component';
import {
	MockAccountService,
	MockApiService,
	MockDirectiveRepo,
} from './test-utils';

export default {
	title: 'Directive Display',

	decorators: [
		moduleMetadata({
			declarations: [],
			imports: [DirectiveModule, HttpClientTestingModule],
			providers: [
				{
					provide: AccountService,
					useClass: MockAccountService,
				},
				{
					provide: ApiService,
					useClass: MockApiService,
				},
			],
		}),
	],

	parameters: {
		viewport: {
			viewports: INITIAL_VIEWPORTS,
		},
	},

	argTypes: {
		archiveName: {
			defaultValue: 'Volunteer Firefighter',
			control: { type: 'text' },
		},
		hasArchiveSteward: {
			defaultValue: true,
			control: 'boolean',
		},
		hasLegacyContact: {
			defaultValue: true,
			control: 'boolean',
		},
		checkLegacyContact: {
			defaultValue: true,
			control: 'boolean',
			description:
				'If the UI should check for the presence of a Legacy Contact and show the "No Plan" warning if the account does not have one assigned.',
		},
		archiveStewardEmail: {
			defaultValue: 'test@example.com',
			control: 'text',
		},
		note: {
			defaultValue: 'Test note for Archive Steward',
			control: 'text',
		},
		failDirectivesFetch: {
			description:
				'Simulates a backend/network error when fetching the initial Directive.',
			defaultValue: false,
			control: 'boolean',
		},
	},

	component: DirectiveDisplayComponent,

	globals: {
		viewport: {
			value: 'archiveSettingsDesktop',
			isRotated: false,
		},
	},
} as Meta;

const storyTemplate = (args) => {
	MockAccountService.mockArchive = new ArchiveVO({
		fullName: args.archiveName ?? 'Volunteer Firefighter',
	});
	MockDirectiveRepo.reset();
	MockDirectiveRepo.failRequest = args.failDirectivesFetch;
	MockDirectiveRepo.mockStewardEmail = args.hasArchiveSteward
		? args.archiveStewardEmail
		: null;
	MockDirectiveRepo.mockNote = args.hasArchiveSteward ? args.note : null;
	MockDirectiveRepo.legacyContactEmail = args.hasLegacyContact
		? 'test@example.com'
		: null;
	MockDirectiveRepo.legacyContactName = args.hasLegacyContact
		? 'Unit Test'
		: null;
	return {
		moduleMetadata: {
			providers: [
				{
					provide: '__force_rerender_on_propschange__',
					useValue:
						args.archiveName +
						args.hasArchiveSteward +
						args.note +
						args.archiveStewardEmail +
						args.failDirectivesFetch +
						args.hasLegacyContact +
						args.checkLegacyContact,
				},
			],
		},
		props: {
			checkLegacyContact: args.checkLegacyContact,
		},
	};
};

export const WithDirective = storyTemplate.bind({});

export const WithoutDirective = storyTemplate.bind({});
WithoutDirective.args = {
	archiveName: 'Volunteer Firefighter',
	hasArchiveSteward: false,
	archiveStewardEmail: 'test@example.com',
	note: 'Test note for Archive Steward',
};

export const NoPlan = storyTemplate.bind({});
NoPlan.args = {
	hasArchiveSteward: false,
	checkLegacyContact: true,
	hasLegacyContact: false,
};

export const ApiError = storyTemplate.bind({});
ApiError.args = {
	failDirectivesFetch: true,
};
