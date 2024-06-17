/* @format */
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { ButtonComponent } from './button.component';

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

const meta: Meta<ButtonComponent> = {
  title: 'Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  render: (args: ButtonComponent) => ({
    props: {
      variant: 'primary',
      ...args,
    },
  }),
  argTypes: {
    disabled: { control: 'boolean' },
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'tertiary'],
    },
    height: {
      options: ['medium', 'large'],
      control: { type: 'radio' },
    },
    mode: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
    },
    size: {
      options: ['hug', 'fill'],
      control: { type: 'radio' },
    },
    icon: { control: 'text' },
    orientation: {
      options: ['left', 'right'],
      control: { type: 'radio' },
    },
    faIcon: { control: 'text' },
    buttonType: {
      options: ['submit', 'reset', 'button'],
      control: { type: 'radio' },
    },
  },
};

export default meta;
type ButtonStory = StoryObj<ButtonComponent>;

export const PrimaryMedium: ButtonStory = {
  args: { variant: 'primary' },
};

export const SecondaryMedium: ButtonStory = {
  args: { variant: 'secondary' },
};

export const PrimaryLarge: ButtonStory = {
  args: { variant: 'primary', height: 'large' },
};

export const SecondaryLarge: ButtonStory = {
  args: { variant: 'secondary', height: 'large' },
};

export const PrimaryFill: ButtonStory = {
  args: { variant: 'primary', size: 'fill' },
};

export const SecondaryFill: ButtonStory = {
  args: { variant: 'secondary', size: 'fill' },
};

export const DarkModePrimary: ButtonStory = {
  args: { variant: 'primary', mode: 'dark' },
  parameters: {
    backgrounds,
  },
};

export const DarkModeSecondary: ButtonStory = {
  args: { variant: 'secondary', mode: 'dark' },
  parameters: {
    backgrounds,
  },
};

export const TertiaryButton: ButtonStory = {
  args: { variant: 'tertiary' },
};
