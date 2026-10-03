import { FileFormat, GeneratedFileStatus, PermanentFile } from './file-vo';
import {
	RecordPreviewState,
	getOriginalFileExtension,
	getRecordPreviewState,
} from './record-preview-state';
import { RecordVO } from './record-vo';

function buildFile(format: FileFormat, type: string): PermanentFile {
	return {
		fileId: 1,
		size: 100,
		format,
		fileURL: `https://example.com/${type}`,
		downloadURL: `https://example.com/download/${type}`,
		type,
	};
}

function buildRecord(
	recordType: string,
	files: PermanentFile[],
	accessCopyStatus?: GeneratedFileStatus | null,
): RecordVO {
	return new RecordVO({
		type: recordType,
		FileVOs: files,
		accessCopyStatus,
	});
}

const docxOriginal = buildFile(FileFormat.Original, 'type.file.document.docx');

describe('getRecordPreviewState', () => {
	describe('records the viewer shows from their original', () => {
		const recordsShownFromTheOriginal: Array<[string, string, string]> = [
			['a JPEG', 'type.record.image', 'type.file.image.jpeg'],
			['an MP4', 'type.record.video', 'type.file.video.mp4'],
			['an MP3', 'type.record.audio', 'type.file.audio.mp3'],
			['a PDF', 'type.record.pdf', 'type.file.pdf.pdf'],
			['a text file', 'type.record.document', 'type.file.document.txt'],
		];

		recordsShownFromTheOriginal.forEach(
			([description, recordType, fileType]) => {
				it(`is ready for ${description} whatever the status says`, () => {
					[
						GeneratedFileStatus.Processing,
						GeneratedFileStatus.Failed,
						null,
					].forEach((accessCopyStatus) => {
						const record = buildRecord(
							recordType,
							[buildFile(FileFormat.Original, fileType)],
							accessCopyStatus,
						);

						expect(getRecordPreviewState(record)).toBe(
							RecordPreviewState.Ready,
						);
					});
				});
			},
		);

		it('is ready for a web archive, which Stela never converts', () => {
			const record = buildRecord(
				'type.record.web_archive',
				[buildFile(FileFormat.Original, 'type.file.archive.wacz')],
				null,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Ready);
		});
	});

	describe('records that need a copy to be shown', () => {
		it('is preparing for a document whose copy is being made', () => {
			const record = buildRecord(
				'type.record.document',
				[docxOriginal],
				GeneratedFileStatus.Processing,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Preparing);
		});

		it('is failed for a document whose copy could not be made', () => {
			const record = buildRecord(
				'type.record.document',
				[docxOriginal],
				GeneratedFileStatus.Failed,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Failed);
		});

		it('is unavailable when Stela never expects a copy', () => {
			const record = buildRecord(
				'type.record.archive',
				[buildFile(FileFormat.Original, 'type.file.archive.zip')],
				null,
			);

			expect(getRecordPreviewState(record)).toBe(
				RecordPreviewState.Unavailable,
			);
		});

		const mediaBrowsersCannotDisplay: Array<[string, string]> = [
			['type.record.image', 'type.file.image.tiff'],
			['type.record.image', 'type.file.image.tif'],
			['type.record.image', 'type.file.image.heic'],
			['type.record.video', 'type.file.video.avi'],
			['type.record.audio', 'type.file.audio.wma'],
		];

		mediaBrowsersCannotDisplay.forEach(([recordType, fileType]) => {
			it(`is preparing for a ${fileType} original whose copy is being made`, () => {
				const record = buildRecord(
					recordType,
					[buildFile(FileFormat.Original, fileType)],
					GeneratedFileStatus.Processing,
				);

				expect(getRecordPreviewState(record)).toBe(
					RecordPreviewState.Preparing,
				);
			});
		});

		it('is ready once a TIFF has its Archivematica copy', () => {
			const record = buildRecord(
				'type.record.image',
				[
					buildFile(FileFormat.Original, 'type.file.image.tiff'),
					buildFile(FileFormat.ArchivematicaAccess, 'type.file.image.jpg'),
				],
				GeneratedFileStatus.Ok,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Ready);
		});

		it('is ready when an Archivematica copy exists, whatever the status says', () => {
			const record = buildRecord(
				'type.record.document',
				[
					docxOriginal,
					buildFile(FileFormat.ArchivematicaAccess, 'type.file.pdf.pdf'),
				],
				GeneratedFileStatus.Processing,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Ready);
		});

		it('is ready with a legacy converted copy even when Stela says it failed', () => {
			const record = buildRecord(
				'type.record.document',
				[docxOriginal, buildFile(FileFormat.Converted, 'type.file.pdf.pdf')],
				GeneratedFileStatus.Failed,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Ready);
		});

		it('ignores an Archivematica copy with no file type', () => {
			const record = buildRecord(
				'type.record.document',
				[
					docxOriginal,
					buildFile(FileFormat.ArchivematicaAccess, 'type.file.unknown.null'),
				],
				GeneratedFileStatus.Processing,
			);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Preparing);
		});

		it('is ready when the record did not come from Stela', () => {
			const record = buildRecord('type.record.document', [docxOriginal]);

			expect(getRecordPreviewState(record)).toBe(RecordPreviewState.Ready);
		});
	});
});

describe('getOriginalFileExtension', () => {
	it("reads the extension from the original file's type", () => {
		const record = buildRecord('type.record.document', [
			buildFile(FileFormat.Converted, 'type.file.pdf.pdf'),
			docxOriginal,
		]);

		expect(getOriginalFileExtension(record)).toBe('docx');
	});

	it('falls back to the upload file name when the original has no type', () => {
		const record = new RecordVO({
			type: 'type.record.unknown',
			uploadFileName: 'Family History Graph.pages',
			FileVOs: [buildFile(FileFormat.Original, 'type.file.unknown.null')],
		});

		expect(getOriginalFileExtension(record)).toBe('pages');
	});

	it('returns nothing when neither the file type nor the name has an extension', () => {
		const record = new RecordVO({
			type: 'type.record.unknown',
			uploadFileName: 'README',
			FileVOs: [],
		});

		expect(getOriginalFileExtension(record)).toBeUndefined();
	});
});
