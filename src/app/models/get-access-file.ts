import { prioritizeIf } from '@root/utils/prioritize-if';
import { FileFormat, PermanentFile } from './file-vo';

export interface HasFiles {
	FileVOs: PermanentFile[];
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
	const files = record?.FileVOs ?? [];
	return (
		getArchivematicaAccess(files) ||
		getPrioritizedConvertedFile(files) ||
		files[0]
	);
}
