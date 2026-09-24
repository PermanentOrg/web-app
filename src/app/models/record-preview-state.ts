import { FileFormat, getFileExtension, PermanentFile } from './file-vo';
import { GeneratedFileStatus } from './generated-file-status';
import { HasThumbnails } from './get-thumbnail';

export enum RecordPreviewState {
	Ready = 'ready',
	Preparing = 'preparing',
	Unavailable = 'unavailable',
	Failed = 'failed',
}

export interface HasPreviewStatus extends HasThumbnails {
	type?: string;
	uploadFileName?: string;
	FileVOs?: PermanentFile[];
	accessCopyStatus?: GeneratedFileStatus | null;
	thumbnail256Status?: GeneratedFileStatus | null;
}

const UNIDENTIFIED_FILE_TYPE = 'type.file.unknown.null';

const isViewableCopy = (file: PermanentFile): boolean =>
	file.format === FileFormat.Converted ||
	(file.format === FileFormat.ArchivematicaAccess &&
		file.type !== UNIDENTIFIED_FILE_TYPE);

const isWebArchive = (record: HasPreviewStatus): boolean =>
	!!record.type?.includes('web_archive');

/**
 * A viewable copy already on the record wins over the status, because Stela
 * only counts Archivematica copies and would call legacy conversions failed.
 * An undefined status means the record didn't come from Stela, so the viewer
 * keeps rendering it the way it always has.
 */
export function getRecordPreviewState(
	record: HasPreviewStatus,
): RecordPreviewState {
	if ((record.FileVOs ?? []).some(isViewableCopy)) {
		return RecordPreviewState.Ready;
	}

	switch (record.accessCopyStatus) {
		case GeneratedFileStatus.Processing:
			return RecordPreviewState.Preparing;
		case GeneratedFileStatus.Failed:
			return RecordPreviewState.Failed;
		case null:
			return isWebArchive(record)
				? RecordPreviewState.Ready
				: RecordPreviewState.Unavailable;
		default:
			return RecordPreviewState.Ready;
	}
}

export function getOriginalFileExtension(
	record: HasPreviewStatus,
): string | undefined {
	const originalFile = record.FileVOs?.find(
		(file) => file.format === FileFormat.Original,
	);
	if (originalFile) {
		return getFileExtension(originalFile);
	}
	return record.uploadFileName?.includes('.')
		? record.uploadFileName.split('.').pop()
		: undefined;
}
