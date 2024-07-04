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
    text: { control: 'text' },
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
    attr: {
      options: ['submit', 'reset', 'button'],
      control: { type: 'radio' },
    },
  },
};

export default meta;
type ButtonStory = StoryObj<ButtonComponent>;

export const PrimaryMedium: ButtonStory = {
  args: { variant: 'primary', text: 'Primary' },
};

export const SecondaryMedium: ButtonStory = {
  args: { variant: 'secondary', text: 'Secondary' },
};

export const PrimaryLarge: ButtonStory = {
  args: { variant: 'primary', text: 'Primary', height: 'large' },
};

export const SecondaryLarge: ButtonStory = {
  args: { variant: 'secondary', text: 'Secondary', height: 'large' },
};

export const PrimaryFill: ButtonStory = {
  args: { variant: 'primary', text: 'Primary', size: 'fill' },
};

export const SecondaryFill: ButtonStory = {
  args: { variant: 'secondary', text: 'Secondary', size: 'fill' },
};

export const DarkModePrimary: ButtonStory = {
  args: { variant: 'primary', text: 'Primary', mode: 'dark' },
  parameters: {
    backgrounds,
  },
};

export const DarkModeSecondary: ButtonStory = {
  args: { variant: 'secondary', text: 'Secondary', mode: 'dark' },
  parameters: {
    backgrounds,
  },
};

export const TertiaryButton: ButtonStory = {
  args: { variant: 'tertiary', text: 'Tertiary' },
};
