import { GeneratedFileStatus } from './generated-file-status';
import { GetThumbnail } from './get-thumbnail';
import {
	getRecordPreviewState,
	HasPreviewStatus,
	RecordPreviewState,
} from './record-preview-state';

export enum RecordThumbnailPlaceholder {
	Preparing = 'preparing',
	Failed = 'failed',
	FileType = 'file-type',
}

export function getRecordThumbnailPlaceholder(
	record: HasPreviewStatus,
): RecordThumbnailPlaceholder | undefined {
	if (GetThumbnail(record)) {
		return undefined;
	}

	const previewState = getRecordPreviewState(record);

	if (
		record.thumbnail256Status === GeneratedFileStatus.Processing ||
		previewState === RecordPreviewState.Preparing
	) {
		return RecordThumbnailPlaceholder.Preparing;
	}

	if (
		record.thumbnail256Status === GeneratedFileStatus.Failed ||
		previewState === RecordPreviewState.Failed
	) {
		return RecordThumbnailPlaceholder.Failed;
	}

	const hasNoStatusFromStela =
		record.thumbnail256Status === undefined &&
		record.accessCopyStatus === undefined;

	return hasNoStatusFromStela ? undefined : RecordThumbnailPlaceholder.FileType;
}
