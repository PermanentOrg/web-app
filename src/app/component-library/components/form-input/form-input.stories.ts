/* @format */
import { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { FormInputComponent } from './form-input.component';

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

const meta: Meta<FormInputComponent> = {
  title: 'Form Input',
  component: FormInputComponent,
  tags: ['autodocs'],
  render: (args: FormInputComponent) => ({
    props: {
      variant: 'light',
      ...args,
      valueChange: action('valueChange'),
    },
  }),
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['text', 'password', 'email', 'number', 'tel'],
    },
    variant: {
      control: { type: 'radio' },
      options: ['light', 'dark'],
    },
    placeholder: { control: 'text' },
    fieldName: { control: 'text' },
    errors: { control: 'text' },
  },
};

export default meta;
type FormInputStory = StoryObj<FormInputComponent>;

export const light: FormInputStory = {
  args: { type: 'text', placeholder: 'Text', variant: 'light' },
  parameters: { backgrounds },
};

export const dark = {
  args: { type: 'text', placeholder: 'Text', variant: 'dark' },
};
