import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { withActions } from '@storybook/addon-actions/decorator';
import { GlamArchiveTypeSelectComponent } from './archive-type-select.component';

const typeSelected = action('typeSelected');

const meta: Meta<GlamArchiveTypeSelectComponent> = {
	title: 'Glam Onboarding: Archive Type Select',
	component: GlamArchiveTypeSelectComponent,
	tags: ['onboarding', 'glam'],
	render: (args) => ({
		props: {
			...args,
			typeSelected,
		},
		template: `<pr-glam-archive-type-select ${argsToTemplate({
			...args,
			typeSelected,
		})}></pr-glam-archive-type-select>`,
	}),
};

export default meta;
type Story = StoryObj<GlamArchiveTypeSelectComponent>;

export const Default: Story = {
	args: {},
};
