import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import {
  MockAccountService,
  MockApiService,
  MockDirectiveRepo,
} from './test-utils';
import { DirectiveModule } from '../../directive.module';
import { DirectiveDisplayComponent } from './directive-display.component';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';

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
      defaultViewport: 'archiveSettingsDesktop',
    },
  },
  argTypes: {
    archiveName: {
      defaultValue: 'The Volunteer Firefighter Archive',
      control: { type: 'text' },
    },
    hasArchiveSteward: {
      defaultValue: true,
      control: 'boolean',
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
} as Meta;

const storyTemplate: Story = (args) => {
  MockAccountService.mockArchive = new ArchiveVO({
    fullName: args.archiveName,
  });
  MockDirectiveRepo.reset();
  MockDirectiveRepo.failRequest = args.failDirectivesFetch;
  MockDirectiveRepo.mockStewardId = args.hasArchiveSteward ? 1 : null;
  MockDirectiveRepo.mockNote = args.hasArchiveSteward ? args.note : null;
  MockDirectiveRepo.mockStewardEmail = args.hasArchiveSteward
    ? args.archiveStewardEmail
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
            args.failDirectivesFetch,
        },
      ],
    },
  };
};

export const Default: Story = storyTemplate.bind({});

export const NoPlan: Story = storyTemplate.bind({});
NoPlan.args = {
  archiveName: 'The Volunteer Firefighter Archive',
  hasArchiveSteward: false,
  archiveStewardEmail: 'test@example.com',
  note: 'Test note for Archive Steward',
};

export const ApiError: Story = storyTemplate.bind({});
ApiError.args = {
  failDirectivesFetch: true,
};
