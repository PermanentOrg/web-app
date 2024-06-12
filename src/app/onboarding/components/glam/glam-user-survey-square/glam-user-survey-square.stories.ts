import { StoryObj, argsToTemplate, Meta } from "@storybook/angular";
import { action } from '@storybook/addon-actions';
import { withActions } from '@storybook/addon-actions/decorator';
import { GlamUserSurveySquareComponent } from "./glam-user-survey-square.component";

const typeSelected = action('typeSelected');

const meta: Meta<GlamUserSurveySquareComponent> = {
    title: 'Glam Onboarding: Archive Type Select',
    component: GlamUserSurveySquareComponent,
    tags: ['onboarding', 'glam'],
    render: (args: GlamUserSurveySquareComponent) => ({
      props: {
        ...args,
        typeSelected,
      },
      template: `<pr-glam-user-survey-square ${argsToTemplate({
        ...args,
        typeSelected,
      })}></pr-glam-user-survey-square>`,
    }),
  };
  
  export default meta;
  type Story = StoryObj<GlamUserSurveySquareComponent>;
  
  export const Default: Story = {
    args: {},
  };