import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
setCompodocJson(docJson);

import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';

const customViewports = {
  archiveSettingsDesktop: {
    name: 'archiveSettingsDesktop',
    styles: {
      width: '787px',
      height: '700px',
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: { inlineStories: true },
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      ...customViewports,
    },
  },
};
