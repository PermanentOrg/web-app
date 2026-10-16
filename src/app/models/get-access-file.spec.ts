import { FileFormat, PermanentFile } from './file-vo';
import {
	GetAccessFile,
	GetOriginalFile,
	HasFiles,
	prioritizeRetrievableFiles,
} from './get-access-file';

function makeTestFile(params: Partial<PermanentFile> = {}): PermanentFile {
	return Object.assign(
		{
			fileId: 0,
			size: 0,
			format: FileFormat.Original,
			fileURL: 'test',
			downloadURL: 'test',
			type: 'test',
		},
		params,
	);
}

function makeFailedOriginalFile(): PermanentFile {
	return makeTestFile({ fileId: 1, size: null, fileURL: null });
}

describe('GetAccessFile', () => {
	it('should return null for an undefined object being passed in', () => {
		let files: HasFiles;

		expect(GetAccessFile(files)).toBeFalsy();
	});

	it('should return null for an object with no FileVOs', () => {
		expect(GetAccessFile({ FileVOs: [] })).toBeFalsy();
	});

	it('should return the only given FileVO', () => {
		expect(
			GetAccessFile({
				FileVOs: [makeTestFile()],
			}),
		).toEqual(makeTestFile());
	});

	it('should prefer archivematica access copies every time', () => {
		const archivematicaFile = makeTestFile({
			format: FileFormat.ArchivematicaAccess,
			fileId: 1,
		});

		expect(
			GetAccessFile({
				FileVOs: [
					makeTestFile(),
					makeTestFile({ format: FileFormat.Converted }),
					archivematicaFile,
					makeTestFile(),
					makeTestFile({ format: FileFormat.Converted }),
				],
			}),
		).toEqual(archivematicaFile);
	});

	it('should prefer converted copies to original files', () => {
		const convertedFile = makeTestFile({
			format: FileFormat.Converted,
			fileId: 1,
		});

		expect(
			GetAccessFile({
				FileVOs: [makeTestFile(), convertedFile, makeTestFile()],
			}),
		).toEqual(convertedFile);
	});

	it('should prefer pdf converted copies to other converted formats', () => {
		const convertedFile = makeTestFile({
			format: FileFormat.Converted,
			fileId: 1,
			type: 'type.file.pdf.pdfa',
		});

		expect(
			GetAccessFile({
				FileVOs: [
					makeTestFile(),
					makeTestFile({ format: FileFormat.Converted, fileId: 2 }),
					convertedFile,
				],
			}),
		).toEqual(convertedFile);
	});

	it('should skip a failed original that comes before a good one', () => {
		const goodOriginal = makeTestFile({ fileId: 2, size: 1315957 });

		expect(
			GetAccessFile({
				FileVOs: [makeFailedOriginalFile(), goodOriginal],
			}),
		).toEqual(goodOriginal);
	});

	it('should still return a failed original when it is the only file', () => {
		const failedOriginal = makeFailedOriginalFile();

		expect(GetAccessFile({ FileVOs: [failedOriginal] })).toEqual(
			failedOriginal,
		);
	});
});

describe('GetOriginalFile', () => {
	it('should return undefined for a record with no FileVOs', () => {
		expect(GetOriginalFile({ FileVOs: [] })).toBeUndefined();
	});

	it('should ignore files that are not originals', () => {
		const original = makeTestFile({ fileId: 2 });

		expect(
			GetOriginalFile({
				FileVOs: [
					makeTestFile({ fileId: 1, format: FileFormat.Converted }),
					original,
				],
			}),
		).toEqual(original);
	});

	it('should prefer a good original over a failed one listed first', () => {
		const goodOriginal = makeTestFile({ fileId: 2, size: 1315957 });

		expect(
			GetOriginalFile({
				FileVOs: [makeFailedOriginalFile(), goodOriginal],
			}),
		).toEqual(goodOriginal);
	});
});

describe('prioritizeRetrievableFiles', () => {
	it('should treat a file without a URL as not retrievable', () => {
		const fileWithoutUrl = makeTestFile({ fileId: 1, fileURL: null });
		const fileWithUrl = makeTestFile({ fileId: 2 });

		expect(prioritizeRetrievableFiles([fileWithoutUrl, fileWithUrl])).toEqual([
			fileWithUrl,
			fileWithoutUrl,
		]);
	});

	it('should keep the original order among retrievable files', () => {
		const firstFile = makeTestFile({ fileId: 1 });
		const secondFile = makeTestFile({ fileId: 2 });

		expect(prioritizeRetrievableFiles([firstFile, secondFile])).toEqual([
			firstFile,
			secondFile,
		]);
	});

	it('should not reorder the array it was given', () => {
		const failedOriginal = makeFailedOriginalFile();
		const goodOriginal = makeTestFile({ fileId: 2 });
		const files = [failedOriginal, goodOriginal];

		prioritizeRetrievableFiles(files);

		expect(files).toEqual([failedOriginal, goodOriginal]);
	});
});
