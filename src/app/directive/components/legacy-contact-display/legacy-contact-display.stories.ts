import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { DirectiveModule } from '../../directive.module';
import { MockAccountService } from '../directive-display/test-utils';
import { MockDirectiveRepo, MockApiService } from './test-utils';
import { LegacyContactDisplayComponent } from './legacy-contact-display.component';

type Story = StoryObj<LegacyContactDisplayComponent>;

const meta: Meta<LegacyContactDisplayComponent> = {
  title: 'Legacy Contact Display',
  component: LegacyContactDisplayComponent,
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
};
export default meta;

interface StoryArgs {
  name?: string;
  email?: string;
  hasLegacyContact?: boolean;
  throwError?: boolean;
}

const StoryTemplate: (a: StoryArgs) => Story = (args: StoryArgs) => {
  return {
    render: () => {
      MockDirectiveRepo.reset();
      if (args.hasLegacyContact) {
        MockDirectiveRepo.legacyContactName = args.name;
        MockDirectiveRepo.legacyContactEmail = args.email;
      }
      MockDirectiveRepo.throwError = !!args.throwError;
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

export const Default: Story = StoryTemplate({
  hasLegacyContact: false,
  throwError: false,
});

export const WithLegacyContact: Story = StoryTemplate({
  name: 'Test User',
  email: 'email@example.com',
  hasLegacyContact: true,
  throwError: false,
});

export const ApiError: Story = StoryTemplate({
  throwError: true,
});
