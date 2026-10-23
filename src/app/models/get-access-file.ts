import { FileFormat, PermanentFile } from './file-vo';

export interface HasFiles {
	FileVOs: PermanentFile[];
}

function hasRetrievableContent(file: PermanentFile): boolean {
	return Boolean(file.fileURL) && file.size !== null && file.size !== undefined;
}

/**
 * Returns the first file that has content to fetch, or the first file when
 * none of them do, so a failed, empty file is picked only as a last resort.
 */
export function getFirstRetrievableFile(
	files: PermanentFile[],
): PermanentFile | undefined {
	return files.find(hasRetrievableContent) ?? files[0];
}

function getArchivematicaAccess(files: PermanentFile[]) {
	return getFirstRetrievableFile(
		files.filter((file) => file.format === FileFormat.ArchivematicaAccess),
	);
}

function getPrioritizedConvertedFile(files: PermanentFile[]) {
	const convertedFiles = files.filter(
		(file) => file.format === FileFormat.Converted,
	);
	const pdfConvertedFiles = convertedFiles.filter((file) =>
		file.type?.includes('pdf'),
	);
	return (
		getFirstRetrievableFile(pdfConvertedFiles) ??
		getFirstRetrievableFile(convertedFiles)
	);
}

export function GetAccessFile(record: HasFiles): PermanentFile | undefined {
	const files = record?.FileVOs ?? [];
	return (
		getArchivematicaAccess(files) ||
		getPrioritizedConvertedFile(files) ||
		getFirstRetrievableFile(files)
	);
}

export function GetOriginalFile(record: HasFiles): PermanentFile | undefined {
	return getFirstRetrievableFile(
		(record?.FileVOs ?? []).filter(
			(file) => file.format === FileFormat.Original,
		),
	);
}
