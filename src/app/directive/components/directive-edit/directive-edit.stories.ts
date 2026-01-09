import { Meta, moduleMetadata } from '@storybook/angular';
import { action } from 'storybook/actions';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO } from '@models/index';
import { MockAccountService } from '../directive-display/test-utils';
import { DirectiveModule } from '../../directive.module';
import { MockDirectiveRepo, createDirective } from './test-utils';
import { DirectiveEditComponent } from './directive-edit.component';

const savedAction = action('savedDirective');
const errorAction = action('Error Message in UI');

class MockApiService {
	public directive = new MockDirectiveRepo();
}

class MockMessageService {
	public showError(err: string): void {
		errorAction(err);
	}
}

export default {
	title: 'Directive Edit',

	decorators: [
		moduleMetadata({
			declarations: [],
			imports: [DirectiveModule, HttpClientTestingModule],
			providers: [
				{
					provide: ApiService,
					useClass: MockApiService,
				},
				{
					provide: AccountService,
					useClass: MockAccountService,
				},
				{
					provide: MessageService,
					useClass: MockMessageService,
				},
			],
		}),
	],

	parameters: {
		viewport: {
			viewports: INITIAL_VIEWPORTS,
		},
	},

	component: DirectiveEditComponent,

	argTypes: {
		accountExists: {
			description:
				'Controls whether the mocked Directive API returns successfully or with a "Steward Account Not Found" error',
			defaultValue: true,
			control: 'boolean',
		},
		editingExistingDirective: {
			defaultValue: false,
			control: 'boolean',
		},
		existingDirectiveSteward: {
			defaultValue: null,
			control: 'text',
		},
		existingDirectiveNote: {
			defaultValue: null,
			control: 'text',
		},
		failSaveRequest: {
			description:
				'Simulates a backend/network error when saving the Directive.',
			defaultValue: false,
			control: 'boolean',
		},
		savedDirective: { action: 'savedDirective' },
	},

	globals: {
		viewport: {
			value: 'archiveSettingsDesktop',
			isRotated: false,
		},
	},
} as Meta;

const Template = (args) => {
	MockAccountService.mockArchive = new ArchiveVO({
		fullName: 'The Storybook Archive',
		archiveId: 1,
	});
	MockDirectiveRepo.reset();
	MockDirectiveRepo.errorDelay = 3000;
	MockDirectiveRepo.failRequest = args.failSaveRequest;
	MockDirectiveRepo.accountExists = args.accountExists;
	const directive = args.editingExistingDirective
		? createDirective(args.existingDirectiveSteward, args.existingDirectiveNote)
		: null;
	return {
		moduleMetadata: {
			providers: [
				{
					provide: '__force_rerender_on_propschange__',
					useValue: JSON.stringify(args),
				},
			],
		},
		props: {
			directive,
			savedDirective: savedAction,
		},
	};
};

export const Create = Template.bind({});
Create.args = {
	editingExistingDirective: false,
	failSaveRequest: false,
	accountExists: true,
};

export const Edit = Template.bind({});
Edit.args = {
	editingExistingDirective: true,
	existingDirectiveSteward: 'test@example.com',
	existingDirectiveNote:
		'Hello,\n\nI have designated you as the steward of my Storybook archive. ' +
		'I hope that you will be able to share these photos with the others and ' +
		'make sure they can hang on to them. Thank you.\n\nStorybook',
	failSaveRequest: false,
	accountExists: true,
};

export const Error = Template.bind({});
Error.args = Object.assign(Edit.args, {
	failSaveRequest: true,
});

export const NoAccountForEmail = Template.bind({});
NoAccountForEmail.args = Object.assign(Edit.args, {
	accountExists: false,
});
