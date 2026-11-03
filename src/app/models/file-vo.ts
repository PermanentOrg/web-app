export const enum FileFormat {
	Original = 'file.format.original',
	Converted = 'file.format.converted',
	ArchivematicaAccess = 'file.format.archivematica.access',
}

export enum GeneratedFileStatus {
	Ok = 'ok',
	Processing = 'processing',
	Failed = 'failed',
}

export interface PermanentFile {
	fileId: number;
	size: number;
	format: FileFormat;
	parentFileId?: number;
	fileURL: string;
	downloadURL: string;
	type: string;
}

export function getFileExtension(file: PermanentFile): string {
	return file.type.split('.').pop();
}

const UNRECOGNIZED_FILE_FORMAT_LABEL = 'Other copy';

const FILE_FORMAT_LABELS: Record<FileFormat, string> = {
	[FileFormat.Original]: 'Original',
	[FileFormat.Converted]: 'Access copy',
	[FileFormat.ArchivematicaAccess]: 'Access copy',
};

export function getFileFormatLabel(format: FileFormat): string {
	return FILE_FORMAT_LABELS[format] ?? UNRECOGNIZED_FILE_FORMAT_LABEL;
}
