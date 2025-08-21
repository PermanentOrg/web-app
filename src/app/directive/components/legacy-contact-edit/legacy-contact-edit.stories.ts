import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { MessageService } from '@shared/services/message/message.service';
import { LegacyContact } from '@models/directive';
import { action } from 'storybook/actions';
import { DirectiveModule } from '../../directive.module';
import { MockAccountService } from '../directive-display/test-utils';
import { MockDirectiveRepo } from '../legacy-contact-display/test-utils';
import { LegacyContactEditComponent } from './legacy-contact-edit.component';

type Story = StoryObj<LegacyContactEditComponent>;

const savedAction = action('savedLegacyContact');
const errorAction = action('Error Message in UI');

class MockApiService {
	public directive = new MockDirectiveRepo();
}

class MockMessageService {
	public showError(err: string): void {
		errorAction(err);
	}
}

const meta: Meta<LegacyContactEditComponent> = {
	title: 'Legacy Contact Edit',
	component: LegacyContactEditComponent,
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
			defaultViewport: 'archiveSettingsDesktop',
		},
	},
};
export default meta;

interface StoryArgs {
	editing?: boolean;
	legacyContact?: LegacyContact;
	throwError?: boolean;
}

const StoryTemplate: (a: StoryArgs) => Story = (args: StoryArgs) => ({
	render: () => {
		MockDirectiveRepo.reset();
		MockDirectiveRepo.throwError = !!args.throwError;
		if (args.editing) {
			return {
				props: {
					legacyContact: args.legacyContact,
					savedLegacyContact: savedAction,
				},
			};
		}
		return {
			props: {
				savedLegacyContact: savedAction,
			},
		};
	},
	moduleMetadata: {
		providers: [
			{
				provide: '__force_rerender_on_propschange__',
				useValue: JSON.stringify(args),
			},
		],
	},
});

export const Creating: Story = StoryTemplate({
	throwError: false,
});

export const Editing: Story = StoryTemplate({
	editing: true,
	legacyContact: {
		name: 'Test Example',
		email: 'test@example.com',
	},
	throwError: false,
});

export const ApiError: Story = StoryTemplate({
	throwError: true,
});
