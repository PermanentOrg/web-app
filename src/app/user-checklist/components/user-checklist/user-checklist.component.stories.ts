/* @format */
import {
	applicationConfig,
	moduleMetadata,
	type Meta,
	type StoryObj,
} from '@storybook/angular';
import { CHECKLIST_API } from '../../types/checklist-api';
import { ChecklistItem } from '../../types/checklist-item';
import { ChecklistIconComponent } from '../checklist-icon/checklist-icon.component';
import { MinimizeIconComponent } from '../minimize-icon/minimize-icon.component';
import { TaskIconComponent } from '../task-icon/task-icon.component';
import { UserChecklistComponent } from './user-checklist.component';
import { DummyChecklistApi } from './shared-mocks';

const meta: Meta<UserChecklistComponent> = {
	title: 'New Member Checklist',
	component: UserChecklistComponent,
	tags: ['checklist'],
	decorators: [
		moduleMetadata({
			declarations: [
				ChecklistIconComponent,
				TaskIconComponent,
				MinimizeIconComponent,
			],
		}),
		applicationConfig({
			providers: [
				{
					provide: CHECKLIST_API,
					useClass: DummyChecklistApi,
				},
			],
		}),
	],
};

export default meta;
type Story = StoryObj<UserChecklistComponent>;
interface StoryArgs {
	tasks: ChecklistItem[];
}
const StoryTemplate: (a: StoryArgs) => Story = (args: StoryArgs) => {
	return {
		render: () => {
			DummyChecklistApi.reset();
			DummyChecklistApi.items = args.tasks;
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
	tasks: [
		{
			id: 'archiveCreated',
			title: 'Create your first archive',
			completed: true,
		},
		{
			id: 'storageRedeemed',
			title: 'Redeem free storage',
			completed: true,
		},
		{
			id: 'legacyContact',
			title: 'Assign a Legacy Contact',
			completed: false,
		},
		{
			id: 'archiveSteward',
			title: 'Assign an Archive Steward',
			completed: false,
		},
		{
			id: 'archiveProfile',
			title: 'Update Archive Profile',
			completed: false,
		},
		{ id: 'firstUpload', title: 'Upload first file', completed: false },
		{ id: 'publishContent', title: 'Publish your archive', completed: false },
	],
});
