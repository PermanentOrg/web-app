import { prioritizeIf } from '@root/utils/prioritize-if';
import { FileFormat, PermanentFile } from './file-vo';

export interface HasFiles {
	FileVOs: PermanentFile[];
}

function hasRetrievableContent(file: PermanentFile): boolean {
	return Boolean(file.fileURL) && file.size !== null && file.size !== undefined;
}

/**
 * Moves files that have content to fetch ahead of failed, empty ones,
 * keeping the original order otherwise. Returns a new array.
 */
export function prioritizeRetrievableFiles(
	files: PermanentFile[],
): PermanentFile[] {
	return prioritizeIf([...files], hasRetrievableContent);
}

function getArchivematicaAccess(files: PermanentFile[]) {
	return files.find((file) => file.format === FileFormat.ArchivematicaAccess);
}

function getPrioritizedConvertedFile(files: PermanentFile[]) {
	return prioritizeIf(
		files.filter((file) => file.format === FileFormat.Converted),
		(file) => file.type.includes('pdf'),
	)[0];
}

export function GetAccessFile(record: HasFiles): PermanentFile | undefined {
	const files = prioritizeRetrievableFiles(record?.FileVOs ?? []);
	return (
		getArchivematicaAccess(files) ||
		getPrioritizedConvertedFile(files) ||
		files[0]
	);
}

export function GetOriginalFile(record: HasFiles): PermanentFile | undefined {
	return prioritizeRetrievableFiles(record?.FileVOs ?? []).find(
		(file) => file.format === FileFormat.Original,
	);
}
