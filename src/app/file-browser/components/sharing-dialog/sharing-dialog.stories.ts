import { Meta, moduleMetadata } from '@storybook/angular';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

import { AccountService } from '@shared/services/account/account.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { RecordVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';
import { SharingDialogComponent } from './sharing-dialog.component';

import {
	MockAccountService,
	MockShareLinksApiService,
	MockPromptService,
	MockRelationshipService,
	NullDependency,
} from './shared-test-classes';

const testingProviders = [
	{
		provide: DIALOG_DATA,
		useValue: {
			item: new RecordVO({
				displayName: 'Test File',
				accessRole: 'access.role.owner',
			}),
		},
	},
	{
		provide: AccountService,
		useClass: MockAccountService,
	},
	{
		provide: DialogRef,
		useClass: NullDependency,
	},
	{
		provide: PromptService,
		useClass: NullDependency,
	},
	{
		provide: ApiService,
		useClass: MockShareLinksApiService,
	},
	{
		provide: MessageService,
		useClass: NullDependency,
	},
	{
		provide: ActivatedRoute,
		useClass: NullDependency,
	},
	{
		provide: RelationshipService,
		useClass: MockRelationshipService,
	},
	{
		provide: PromptService,
		useClass: MockPromptService,
	},
];

export default {
	title: 'SharingDialog',
	decorators: [
		moduleMetadata({
			declarations: [],
			imports: [FileBrowserComponentsModule, NoopAnimationsModule],
			providers: testingProviders,
		}),
	],
	component: SharingDialogComponent,
} as Meta;

export const SharingDialog = () => ({
	props: {},
});
