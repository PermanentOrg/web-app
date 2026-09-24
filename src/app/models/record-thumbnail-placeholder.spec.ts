import { FileFormat, PermanentFile } from './file-vo';
import { GeneratedFileStatus } from './generated-file-status';
import {
	getRecordThumbnailPlaceholder,
	RecordThumbnailPlaceholder,
} from './record-thumbnail-placeholder';

const makeFile = (params: Partial<PermanentFile> = {}): PermanentFile => ({
	fileId: 1,
	size: 1024,
	format: FileFormat.Original,
	fileURL: 'https://example.com/file',
	downloadURL: 'https://example.com/download',
	type: 'type.file.document.docx',
	...params,
});

const originalDocx = makeFile();

describe('getRecordThumbnailPlaceholder', () => {
	it('shows no placeholder when the record has a thumbnail', () => {
		expect(
			getRecordThumbnailPlaceholder({
				thumbURL200: 'https://example.com/thumb200.jpg',
				thumbnail256Status: GeneratedFileStatus.Failed,
				accessCopyStatus: GeneratedFileStatus.Failed,
				FileVOs: [originalDocx],
			}),
		).toBeUndefined();
	});

	it('shows preparing while the thumbnail is processing', () => {
		expect(
			getRecordThumbnailPlaceholder({
				thumbnail256Status: GeneratedFileStatus.Processing,
				accessCopyStatus: GeneratedFileStatus.Ok,
			}),
		).toBe(RecordThumbnailPlaceholder.Preparing);
	});

	it('shows preparing for a video whose access copy is processing, since videos never get a 256px thumbnail status', () => {
		expect(
			getRecordThumbnailPlaceholder({
				FileVOs: [makeFile({ type: 'type.file.video.mp4' })],
				thumbnail256Status: null,
				accessCopyStatus: GeneratedFileStatus.Processing,
			}),
		).toBe(RecordThumbnailPlaceholder.Preparing);
	});

	it('shows failed when the thumbnail failed', () => {
		expect(
			getRecordThumbnailPlaceholder({
				thumbnail256Status: GeneratedFileStatus.Failed,
				accessCopyStatus: null,
			}),
		).toBe(RecordThumbnailPlaceholder.Failed);
	});

	it('shows failed when the access copy failed', () => {
		expect(
			getRecordThumbnailPlaceholder({
				FileVOs: [originalDocx],
				thumbnail256Status: null,
				accessCopyStatus: GeneratedFileStatus.Failed,
			}),
		).toBe(RecordThumbnailPlaceholder.Failed);
	});

	it('shows the file type when neither copy will ever be made', () => {
		expect(
			getRecordThumbnailPlaceholder({
				FileVOs: [makeFile({ type: 'type.file.image.svg' })],
				thumbnail256Status: null,
				accessCopyStatus: null,
			}),
		).toBe(RecordThumbnailPlaceholder.FileType);
	});

	it('keeps the old empty thumbnail when the record has no status from Stela', () => {
		expect(
			getRecordThumbnailPlaceholder({ FileVOs: [originalDocx] }),
		).toBeUndefined();
	});
});
