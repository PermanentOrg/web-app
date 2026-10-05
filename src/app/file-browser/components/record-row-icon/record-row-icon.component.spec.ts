import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FileFormat, GeneratedFileStatus } from '@models/file-vo';
import { RecordVO, RecordVOData } from '@models/record-vo';
import { buildPermanentFile } from '@models/testing/build-permanent-file';
import {
	GeneratedRecordRowIcon,
	RecordRowIcon,
	RecordRowIconComponent,
	getRecordRowIcon,
} from './record-row-icon.component';

describe('RecordRowIconComponent', () => {
	beforeEach(async () => {
		await MockBuilder(RecordRowIconComponent);
	});

	function render(
		icon: GeneratedRecordRowIcon,
		fileExtension: string | undefined = 'svg',
	) {
		return MockRender(RecordRowIconComponent, { icon, fileExtension });
	}

	function iconSource(): string {
		return ngMocks.find('.glyph-image').nativeElement.getAttribute('src');
	}

	it('shows the preparing icon', () => {
		render(RecordRowIcon.Preparing);

		expect(iconSource()).toBe('assets/svg/record-row-icon/preparing.svg');
		expect(ngMocks.findAll('.glyph-extension').length).toBe(0);
	});

	it('shows the failed icon', () => {
		render(RecordRowIcon.Failed);

		expect(iconSource()).toBe('assets/svg/record-row-icon/failed.svg');
		expect(ngMocks.findAll('.glyph-extension').length).toBe(0);
	});

	it('shows the file-type icon with the extension', () => {
		render(RecordRowIcon.FileType, 'mp4');

		expect(iconSource()).toBe('assets/svg/record-row-icon/file-type.svg');
		expect(
			ngMocks.find('.glyph-extension').nativeElement.textContent.trim(),
		).toBe('mp4');
	});

	it('leaves the extension out when it is unknown', () => {
		MockRender(RecordRowIconComponent, { icon: RecordRowIcon.FileType });

		expect(ngMocks.findAll('.glyph-extension').length).toBe(0);
	});
});

function buildRecord(
	recordType: string,
	originalFileType: string,
	statuses: Pick<RecordVOData, 'accessCopyStatus' | 'thumbnail256Status'>,
	thumbnails: Pick<RecordVOData, 'thumbnail256' | 'thumbURL200'> = {},
): RecordVO {
	return new RecordVO({
		type: recordType,
		FileVOs: [buildPermanentFile(FileFormat.Original, originalFileType)],
		...statuses,
		...thumbnails,
	});
}

describe('getRecordRowIcon', () => {
	it('shows the thumbnail whenever there is one, whatever the statuses say', () => {
		const record = buildRecord(
			'type.record.image',
			'type.file.image.tiff',
			{
				accessCopyStatus: GeneratedFileStatus.Processing,
				thumbnail256Status: GeneratedFileStatus.Ok,
			},
			{ thumbnail256: 'https://example.com/256' },
		);

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Thumbnail);
	});

	it('accepts a legacy thumbnail size as a thumbnail', () => {
		const record = buildRecord(
			'type.record.image',
			'type.file.image.jpeg',
			{ thumbnail256Status: GeneratedFileStatus.Failed },
			{ thumbURL200: 'https://example.com/200' },
		);

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Thumbnail);
	});

	it('keeps the placeholder while Stela has not reported on the record', () => {
		const record = buildRecord(
			'type.record.document',
			'type.file.document.docx',
			{
				accessCopyStatus: GeneratedFileStatus.Processing,
			},
		);

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Placeholder);
	});

	it('shows preparing for an image waiting on its thumbnail', () => {
		const record = buildRecord('type.record.image', 'type.file.image.jpeg', {
			accessCopyStatus: GeneratedFileStatus.Processing,
			thumbnail256Status: GeneratedFileStatus.Processing,
		});

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Preparing);
	});

	it('shows the file type for an image whose thumbnail failed but which still opens', () => {
		const record = buildRecord('type.record.image', 'type.file.image.jpeg', {
			accessCopyStatus: GeneratedFileStatus.Failed,
			thumbnail256Status: GeneratedFileStatus.Failed,
		});

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.FileType);
	});

	it('shows preparing for a document whose copy is being made', () => {
		const record = buildRecord(
			'type.record.document',
			'type.file.document.docx',
			{
				accessCopyStatus: GeneratedFileStatus.Processing,
				thumbnail256Status: GeneratedFileStatus.Processing,
			},
		);

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Preparing);
	});

	it('shows failed for a document whose copy failed', () => {
		const record = buildRecord(
			'type.record.document',
			'type.file.document.docx',
			{
				accessCopyStatus: GeneratedFileStatus.Failed,
				thumbnail256Status: GeneratedFileStatus.Failed,
			},
		);

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Failed);
	});

	it('shows preparing for an AVI, which never gets a thumbnail, while its copy is being made', () => {
		const record = buildRecord('type.record.video', 'type.file.video.avi', {
			accessCopyStatus: GeneratedFileStatus.Processing,
			thumbnail256Status: null,
		});

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.Preparing);
	});

	it('shows the file type for an MP4, which never gets a thumbnail', () => {
		const record = buildRecord('type.record.video', 'type.file.video.mp4', {
			accessCopyStatus: GeneratedFileStatus.Processing,
			thumbnail256Status: null,
		});

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.FileType);
	});

	it('shows the file type for an SVG that can never be shown here', () => {
		const record = buildRecord('type.record.unknown', 'type.file.image.svg', {
			accessCopyStatus: null,
			thumbnail256Status: null,
		});

		expect(getRecordRowIcon(record)).toBe(RecordRowIcon.FileType);
	});
});
