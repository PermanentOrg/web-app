import {
  StoryObj,
  argsToTemplate,
  Meta,
  moduleMetadata,
} from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { withActions } from '@storybook/addon-actions/decorator';
import { GlamUserSurveySquareComponent } from './glam-user-survey-square.component';
import { CheckboxComponent } from '@root/app/component-library/components/checkbox/checkbox.component';

const selectedChange = action('selectedChange');

const meta: Meta<GlamUserSurveySquareComponent> = {
  title: 'Glam Onboarding: Survey Square',
  component: GlamUserSurveySquareComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [GlamUserSurveySquareComponent, CheckboxComponent], // Import the necessary standalone components
    }),
  ],
  render: (args: GlamUserSurveySquareComponent) => ({
    props: {
      ...args,
      selected:true,
      text: 'Digitize or transfer my materials securely.',
    },
    argTypes: {
      selected: { control: 'boolean' },
      text: { control: 'text' },
      tag: { control: 'text' },
    },
  }),
};

export default meta;
type Story = StoryObj<GlamUserSurveySquareComponent>;

export const Primary: Story = {
  args: {
    text: 'Digitize or transfer my materials securely.',
    tag: 'square',
    selected: false,
  },
};

export const Secondary: Story = {
  args: {
    text: 'Digitize or transfer my materials securddely.',
    tag: 'square',
    selected: true,
  },
};
