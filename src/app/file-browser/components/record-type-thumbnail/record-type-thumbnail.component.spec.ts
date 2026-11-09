import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { RecordTypeThumbnailComponent } from './record-type-thumbnail.component';

describe('RecordTypeThumbnailComponent', () => {
	beforeEach(async () => {
		await MockBuilder(RecordTypeThumbnailComponent);
	});

	function renderedIconFor(recordType: string): string {
		MockRender(RecordTypeThumbnailComponent, { recordType });
		return ngMocks.find('.record-type-icon').nativeElement.getAttribute('src');
	}

	it('shows the image icon for images', () => {
		expect(renderedIconFor('type.record.image')).toBe(
			'assets/svg/record-type-thumbnail/image.svg',
		);
	});

	it('shows the video icon for videos', () => {
		expect(renderedIconFor('type.record.video')).toBe(
			'assets/svg/record-type-thumbnail/video.svg',
		);
	});

	it('shows the audio icon for audio', () => {
		expect(renderedIconFor('type.record.audio')).toBe(
			'assets/svg/record-type-thumbnail/audio.svg',
		);
	});

	[
		'type.record.document',
		'type.record.pdf',
		'type.record.presentation',
		'type.record.spreadsheet',
	].forEach((documentLikeType) => {
		it(`shows the document icon for ${documentLikeType}`, () => {
			expect(renderedIconFor(documentLikeType)).toBe(
				'assets/svg/record-type-thumbnail/document.svg',
			);
		});
	});

	it('shows the archive icon for archives', () => {
		expect(renderedIconFor('type.record.archive')).toBe(
			'assets/svg/record-type-thumbnail/archive.svg',
		);
	});

	['type.record.unknown', 'type.record.web_archive', ''].forEach(
		(unsupportedType) => {
			it(`shows the unsupported file icon for "${unsupportedType}"`, () => {
				expect(renderedIconFor(unsupportedType)).toBe(
					'assets/svg/record-type-thumbnail/unsupported.svg',
				);
			});
		},
	);
});
