/* @format */
import {
	Meta,
	StoryObj,
	applicationConfig,
	moduleMetadata,
} from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import {
	FaIconLibrary,
	FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { APP_INITIALIZER } from '@angular/core';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
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
	decorators: [
		applicationConfig({
			providers: [
				{
					provide: APP_INITIALIZER,
					useFactory: (iconLibrary: FaIconLibrary) => async () => {
						iconLibrary.addIcons(faExclamationCircle);
					},
					deps: [FaIconLibrary],
					multi: true,
				},
			],
		}),
		moduleMetadata({
			imports: [FontAwesomeModule],
		}),
	],
	component: FormInputComponent,
	tags: ['autodocs'],
	render: (args) => ({
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

export const Light: FormInputStory = {
	args: { type: 'text', placeholder: 'Text', variant: 'light' },
};

export const LightDarkBackground: FormInputStory = {
	args: { type: 'text', placeholder: 'Text', variant: 'light' },
	parameters: { backgrounds },
};

export const Dark = {
	args: { type: 'text', placeholder: 'Text', variant: 'dark' },
};
