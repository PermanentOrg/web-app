import type { Preview } from '@storybook/angular';

import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

const customViewports = {
	archiveSettingsDesktop: {
		name: 'archiveSettingsDesktop',
		styles: {
			width: '787px',
			height: '700px',
		},
	},
};

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		viewport: {
			options: {
				...MINIMAL_VIEWPORTS,
				...customViewports,
			},
		},
	},
};

export default preview;
