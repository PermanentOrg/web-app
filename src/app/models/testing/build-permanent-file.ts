import { FileFormat, PermanentFile } from '../file-vo';

export function buildPermanentFile(
	format: FileFormat,
	type: string,
): PermanentFile {
	return {
		fileId: 1,
		size: 100,
		format,
		fileURL: `https://example.com/${type}`,
		downloadURL: `https://example.com/download/${type}`,
		type,
	};
}
