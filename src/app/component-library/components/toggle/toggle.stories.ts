/* @format */
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { ComponentsModule } from '../../components.module';
import { ToggleComponent } from './toggle.component';

const meta: Meta<ToggleComponent> = {
  title: 'Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  render: (args: ToggleComponent) => ({
    props: {
      ...args,
      isCheckedChange: action('isCheckedChange'),
    },
    argTypes: {
      isChecked: 'checked',
      text: 'text',
      disabled: 'disabled',
    },
  }),
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Enabled: Story = {
  args: {
    isChecked: true,
    text: 'Toggle Example',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    text: 'Disabled Toggle Example',
  },
};
