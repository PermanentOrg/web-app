import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { RecordPreviewState } from '@models/record-preview-state';
import { RecordPreviewStateComponent } from './record-preview-state.component';

describe('RecordPreviewStateComponent', () => {
	beforeEach(async () => {
		await MockBuilder(RecordPreviewStateComponent);
	});

	function render(
		previewState: RecordPreviewState,
		fileExtension: string | undefined = 'docx',
		canDownload = true,
	) {
		return MockRender(RecordPreviewStateComponent, {
			previewState,
			fileExtension,
			canDownload,
		});
	}

	function textOf(selector: string): string {
		return ngMocks.find(selector).nativeElement.textContent.trim();
	}

	it('tells the member the copy is still being prepared', () => {
		render(RecordPreviewState.Preparing);

		expect(textOf('.heading')).toBe("We're still preparing this file to view");
		expect(textOf('.help-link')).toBe(
			'What does it mean when my file is processing?',
		);
	});

	it('tells the member the copy could not be made', () => {
		render(RecordPreviewState.Failed);

		expect(textOf('.heading')).toBe(
			"We couldn't make a copy of this file to view",
		);

		expect(textOf('.help-link')).toBe('Get help with this file');
	});

	it('shows the extension on the icon only when the file cannot be shown', () => {
		render(RecordPreviewState.Unavailable, 'svg');

		expect(textOf('.heading')).toBe(
			"This file is stored, but we can't show it here",
		);

		expect(textOf('.icon-extension')).toBe('svg');
	});

	it('does not put the extension on the preparing icon', () => {
		render(RecordPreviewState.Preparing);

		expect(ngMocks.findAll('.icon-extension').length).toBe(0);
	});

	it("labels the download with the original's extension", () => {
		render(RecordPreviewState.Failed, 'docx');

		expect(textOf('.download-extension')).toBe('docx');
	});

	it('emits downloadOriginal when the download button is clicked', () => {
		const fixture = render(RecordPreviewState.Preparing);
		const component = fixture.point.componentInstance;
		const downloadSpy = spyOn(component.downloadOriginal, 'emit');

		ngMocks.click('.download-original');

		expect(downloadSpy).toHaveBeenCalled();
	});

	it('hides the download button when downloads are not allowed', () => {
		render(RecordPreviewState.Preparing, 'docx', false);

		expect(ngMocks.findAll('.download-original').length).toBe(0);
	});

	const helpLinkUrls: Array<[RecordPreviewState, string]> = [
		[
			RecordPreviewState.Preparing,
			'https://permanent.zohodesk.com/portal/en/kb/articles/what-does-it-mean-when-my-file-is-processing',
		],
		[
			RecordPreviewState.Unavailable,
			'https://permanent.zohodesk.com/portal/en/kb/articles/file-types-that-we-accept-and-support',
		],
		[
			RecordPreviewState.Failed,
			'https://permanent.zohodesk.com/portal/en/newticket',
		],
	];

	helpLinkUrls.forEach(([previewState, helpLinkUrl]) => {
		it(`opens the ${previewState} help article in a new tab`, () => {
			render(previewState);
			const helpLink = ngMocks.find('.help-link').nativeElement;

			expect(helpLink.getAttribute('href')).toBe(helpLinkUrl);
			expect(helpLink.getAttribute('target')).toBe('_blank');
		});
	});
});
