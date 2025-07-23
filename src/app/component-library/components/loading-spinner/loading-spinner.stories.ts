/* @format */
import { Meta, StoryObj } from '@storybook/angular';
import { LoadingSpinnerComponent } from './loading-spinner.component';

const meta: Meta<LoadingSpinnerComponent> = {
	title: 'LoadingSpinner',
	component: LoadingSpinnerComponent,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;
type SpinnerStory = StoryObj<LoadingSpinnerComponent>;

export const Spinner: SpinnerStory = {};
