import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { RecordPreviewState } from '@models/record-preview-state';
import {
	ACCESS_COPY_HELP_LINK,
	RecordPreviewStateComponent,
} from './record-preview-state.component';

const renderPreviewState = (inputs: {
	previewState: RecordPreviewState;
	fileExtension?: string;
	canDownload?: boolean;
	downloadOriginal?: () => void;
}) =>
	MockRender(
		RecordPreviewStateComponent,
		{
			fileExtension: undefined,
			canDownload: true,
			downloadOriginal: () => undefined,
			...inputs,
		},
		{ reset: true },
	);

const textOf = (selector: string): string =>
	ngMocks.formatText(ngMocks.find(selector));

describe('RecordPreviewStateComponent', () => {
	beforeEach(async () => {
		await MockBuilder(RecordPreviewStateComponent);
	});

	it('explains that a file is still being prepared', () => {
		renderPreviewState({
			previewState: RecordPreviewState.Preparing,
			fileExtension: 'docx',
		});

		expect(textOf('.record-preview-state-heading')).toBe(
			"We're still preparing this file to view",
		);

		expect(textOf('.record-preview-state-help-link')).toBe(
			'What does it mean when my file is processing?',
		);

		expect(
			ngMocks.find('.record-preview-state-icon img').nativeElement.src,
		).toContain('assets/svg/access-copy/preview-preparing.svg');
	});

	it('shows the extension on the icon only when no copy can be made', () => {
		renderPreviewState({
			previewState: RecordPreviewState.Unavailable,
			fileExtension: 'svg',
		});

		expect(textOf('.record-preview-state-heading')).toBe(
			"This file is stored, but we can't show it here",
		);

		expect(textOf('.record-preview-state-body')).toContain(
			"This isn't a format we can make a viewable copy of.",
		);

		expect(textOf('.record-preview-state-icon-extension')).toBe('svg');
	});

	it('explains that making the copy failed', () => {
		renderPreviewState({
			previewState: RecordPreviewState.Failed,
			fileExtension: 'docx',
		});

		expect(textOf('.record-preview-state-heading')).toBe(
			"We couldn't make a copy of this file to view",
		);

		expect(ngMocks.findAll('.record-preview-state-icon-extension').length).toBe(
			0,
		);
	});

	it('labels the download button with the original extension', () => {
		renderPreviewState({
			previewState: RecordPreviewState.Failed,
			fileExtension: 'docx',
		});

		expect(textOf('.record-preview-state-download-extension')).toBe('docx');
	});

	it('asks for the original to be downloaded when the button is clicked', () => {
		const downloadOriginal = jasmine.createSpy('downloadOriginal');
		renderPreviewState({
			previewState: RecordPreviewState.Preparing,
			downloadOriginal,
		});

		ngMocks.click('.record-preview-state-download');

		expect(downloadOriginal).toHaveBeenCalledTimes(1);
	});

	it('hides the download button when downloads are not allowed', () => {
		renderPreviewState({
			previewState: RecordPreviewState.Preparing,
			canDownload: false,
		});

		expect(ngMocks.findAll('.record-preview-state-download').length).toBe(0);
	});

	it('opens the help link in a new tab', () => {
		renderPreviewState({ previewState: RecordPreviewState.Unavailable });

		const helpLink = ngMocks.find('.record-preview-state-help-link');

		expect(helpLink.attributes.target).toBe('_blank');
		expect(helpLink.nativeElement.getAttribute('href')).toBe(
			ACCESS_COPY_HELP_LINK,
		);
	});
});
