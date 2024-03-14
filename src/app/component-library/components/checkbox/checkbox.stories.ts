/* @format */
import { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const backgrounds = {
  default: 'blueGradient',
  values: [
    {
      name: 'blueGradient',
      value: 'linear-gradient(103.06deg, #131B4A 0%, #364493 100%);',
    },
    {
      name: 'white',
      value: '#ffffff',
    },
  ],
};

const meta: Meta<CheckboxComponent> = {
  title: 'Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  render: (args: CheckboxComponent) => ({
    props: {
      variant: 'primary',
      ...args,
    },
  }),
  argTypes: {
    text: { control: 'text' },
    disabled: { control: 'boolean' },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type CheckboxStory = StoryObj<CheckboxComponent>;

export const Primary: CheckboxStory = {
  args: { variant: 'primary', text: 'Primary' },
};

export const Secondary: CheckboxStory = {
  args: { variant: 'secondary', text: 'Secondary' },
  parameters: { backgrounds },
};
