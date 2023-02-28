import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';

import { SharingDialogComponent } from './sharing-dialog.component';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO, RecordVO, ShareByUrlVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
  MockAccountService,
  MockApiService,
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
    useClass: MockApiService,
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

export const SharingDialog: Story = () => ({
  props: {},
});
