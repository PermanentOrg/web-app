import type { StorybookConfig } from '@storybook/angular';
const config: StorybookConfig = {
  staticDirs: [{ from: '../src/assets', to: '/assets' }],
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-mdx-gfm',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {},
  core: {
    disableTelemetry: true,
  },
};
export default config;
