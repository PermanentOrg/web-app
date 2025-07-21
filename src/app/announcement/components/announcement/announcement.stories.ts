/* @format */
import {
  componentWrapperDecorator,
  Meta,
  moduleMetadata,
} from '@storybook/angular';
import { AnnouncementModule } from '../../announcement.module';

import { AnnouncementComponent } from './announcement.component';

export default {
  title: 'Announcement',
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [AnnouncementModule],
    }),
  ],
  component: AnnouncementComponent,
} as Meta;

export const Announcement = () => ({
  props: {
    eventsList: [
      {
        start: 0,
        end: Infinity,
        message:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Odio ut enim blandit volutpat maecenas volutpat blandit aliquam etiam.',
      },
    ],
  },
});

Announcement.decorators = [
  componentWrapperDecorator((story) => {
    localStorage.clear();
    return story;
  }),
];
