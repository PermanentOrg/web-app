import { FileFormat, PermanentFile } from './file-vo';
import { GeneratedFileStatus } from './generated-file-status';
import {
	getOriginalFileExtension,
	getRecordPreviewState,
	HasPreviewStatus,
	RecordPreviewState,
} from './record-preview-state';

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

describe('getRecordPreviewState', () => {
	it('is ready when an Archivematica access copy exists, whatever the status says', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [
					originalDocx,
					makeFile({
						format: FileFormat.ArchivematicaAccess,
						type: 'type.file.pdf.pdf',
					}),
				],
				accessCopyStatus: GeneratedFileStatus.Failed,
			}),
		).toBe(RecordPreviewState.Ready);
	});

	it('is ready when only a legacy converted copy exists, even though Stela says failed', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [
					originalDocx,
					makeFile({ format: FileFormat.Converted, type: 'type.file.pdf.pdf' }),
				],
				accessCopyStatus: GeneratedFileStatus.Failed,
			}),
		).toBe(RecordPreviewState.Ready);
	});

	it('does not count an Archivematica copy with no identified file type as viewable', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [
					originalDocx,
					makeFile({
						format: FileFormat.ArchivematicaAccess,
						type: 'type.file.unknown.null',
					}),
				],
				accessCopyStatus: GeneratedFileStatus.Failed,
			}),
		).toBe(RecordPreviewState.Failed);
	});

	it('is preparing while the access copy is processing', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [originalDocx],
				accessCopyStatus: GeneratedFileStatus.Processing,
			}),
		).toBe(RecordPreviewState.Preparing);
	});

	it('is preparing for an original the browser could show on its own', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [makeFile({ type: 'type.file.image.jpg' })],
				accessCopyStatus: GeneratedFileStatus.Processing,
			}),
		).toBe(RecordPreviewState.Preparing);
	});

	it('is failed when the access copy failed', () => {
		expect(
			getRecordPreviewState({
				FileVOs: [originalDocx],
				accessCopyStatus: GeneratedFileStatus.Failed,
			}),
		).toBe(RecordPreviewState.Failed);
	});

	it('is unavailable when no access copy will ever be made', () => {
		expect(
			getRecordPreviewState({
				type: 'type.record.image',
				FileVOs: [makeFile({ type: 'type.file.image.svg' })],
				accessCopyStatus: null,
			}),
		).toBe(RecordPreviewState.Unavailable);
	});

	it('keeps web archives ready, since they replay from the original', () => {
		expect(
			getRecordPreviewState({
				type: 'type.record.web_archive',
				FileVOs: [makeFile({ type: 'type.file.archive.wacz' })],
				accessCopyStatus: null,
			}),
		).toBe(RecordPreviewState.Ready);
	});

	it('is ready when the record has no status from Stela', () => {
		expect(getRecordPreviewState({ FileVOs: [originalDocx] })).toBe(
			RecordPreviewState.Ready,
		);
	});

	it('is ready for a record that has not loaded its files yet', () => {
		expect(getRecordPreviewState({})).toBe(RecordPreviewState.Ready);
	});
});

describe('getOriginalFileExtension', () => {
	it("uses the original file's type", () => {
		const record: HasPreviewStatus = {
			FileVOs: [
				makeFile({ format: FileFormat.Converted, type: 'type.file.pdf.pdf' }),
				originalDocx,
			],
		};

		expect(getOriginalFileExtension(record)).toBe('docx');
	});

	it('falls back to the uploaded file name', () => {
		expect(
			getOriginalFileExtension({ uploadFileName: 'family-tree.svg' }),
		).toBe('svg');
	});

	it('has no extension when neither is known', () => {
		expect(getOriginalFileExtension({ uploadFileName: 'README' })).toBe(
			undefined,
		);
	});
});
