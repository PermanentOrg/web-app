import {
	FileFormat,
	GeneratedFileStatus,
	PermanentFile,
	getFileExtension,
} from './file-vo';
import {
	hasDocumentFile,
	isAudioRecord,
	isImageRecord,
	isVideoRecord,
	isWebArchiveRecord,
} from './record-media-type';
import { RecordVO } from './record-vo';

export enum RecordPreviewState {
	Ready = 'ready',
	Preparing = 'preparing',
	Unavailable = 'unavailable',
	Failed = 'failed',
}

export type UnreadyPreviewState = Exclude<
	RecordPreviewState,
	RecordPreviewState.Ready
>;

const UNKNOWN_FILE_TYPE = 'type.file.unknown.null';

const ORIGINAL_TYPES_BROWSERS_CANNOT_DISPLAY = [
	'type.file.image.tiff',
	'type.file.image.tif',
	'type.file.image.heic',
	'type.file.video.avi',
	'type.file.audio.wma',
];

function getOriginalFile(record: RecordVO): PermanentFile | undefined {
	return record.FileVOs?.find((file) => file.format === FileFormat.Original);
}

function isViewableCopy(file: PermanentFile): boolean {
	const isKnownArchivematicaCopy =
		file.format === FileFormat.ArchivematicaAccess &&
		file.type !== UNKNOWN_FILE_TYPE;
	return isKnownArchivematicaCopy || file.format === FileFormat.Converted;
}

/**
 * Mirrors the record viewer's own branches: anything it already renders
 * straight from the original, minus the formats whose originals a browser
 * cannot display.
 */
function canShowFromOriginal(record: RecordVO): boolean {
	if (isWebArchiveRecord(record)) {
		return true;
	}
	const originalFileType = getOriginalFile(record)?.type;
	if (ORIGINAL_TYPES_BROWSERS_CANNOT_DISPLAY.includes(originalFileType)) {
		return false;
	}
	return (
		isImageRecord(record) ||
		isVideoRecord(record) ||
		isAudioRecord(record) ||
		hasDocumentFile(record)
	);
}

export function getRecordPreviewState(record: RecordVO): RecordPreviewState {
	const hasViewableCopy = (record.FileVOs ?? []).some(isViewableCopy);
	if (canShowFromOriginal(record) || hasViewableCopy) {
		return RecordPreviewState.Ready;
	}
	switch (record.accessCopyStatus) {
		case GeneratedFileStatus.Processing:
			return RecordPreviewState.Preparing;
		case GeneratedFileStatus.Failed:
			return RecordPreviewState.Failed;
		case null:
			return RecordPreviewState.Unavailable;
		default:
			return RecordPreviewState.Ready;
	}
}

export function getOriginalFileExtension(record: RecordVO): string | undefined {
	const originalFile = getOriginalFile(record);
	if (originalFile && originalFile.type !== UNKNOWN_FILE_TYPE) {
		return getFileExtension(originalFile);
	}
	const uploadFileName: string | undefined = record.uploadFileName;
	return uploadFileName?.includes('.')
		? uploadFileName.split('.').pop()
		: undefined;
}
