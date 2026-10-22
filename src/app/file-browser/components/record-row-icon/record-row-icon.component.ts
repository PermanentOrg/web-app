import { Component, computed, input } from '@angular/core';
import { GeneratedFileStatus } from '@models/file-vo';
import { GetThumbnail } from '@models/get-thumbnail';
import {
	RecordPreviewState,
	getRecordPreviewState,
} from '@models/record-preview-state';
import { RecordVO } from '@models/record-vo';

export enum RecordRowIcon {
	Thumbnail = 'thumbnail',
	Placeholder = 'placeholder',
	Preparing = 'preparing',
	Failed = 'failed',
	FileType = 'file-type',
}

export type GeneratedRecordRowIcon =
	| RecordRowIcon.Preparing
	| RecordRowIcon.Failed
	| RecordRowIcon.FileType;

/**
 * A record without a thumbnail keeps today's placeholder until Stela reports
 * on it. After that, the failed icon is reserved for a preview that failed:
 * a failed thumbnail alone still opens fine, so it gets the file-type icon.
 */
export function getRecordRowIcon(record: RecordVO): RecordRowIcon {
	if (GetThumbnail(record)) {
		return RecordRowIcon.Thumbnail;
	}
	if (record.thumbnail256Status === undefined) {
		return RecordRowIcon.Placeholder;
	}
	const previewState = getRecordPreviewState(record);
	if (
		record.thumbnail256Status === GeneratedFileStatus.Processing ||
		previewState === RecordPreviewState.Preparing
	) {
		return RecordRowIcon.Preparing;
	}
	if (previewState === RecordPreviewState.Failed) {
		return RecordRowIcon.Failed;
	}
	return RecordRowIcon.FileType;
}

const ICON_URLS: Record<GeneratedRecordRowIcon, string> = {
	[RecordRowIcon.Preparing]: 'assets/svg/record-row-icon/preparing.svg',
	[RecordRowIcon.Failed]: 'assets/svg/record-row-icon/failed.svg',
	[RecordRowIcon.FileType]: 'assets/svg/record-row-icon/file-type.svg',
};

@Component({
	selector: 'pr-record-row-icon',
	standalone: true,
	templateUrl: './record-row-icon.component.html',
	styleUrls: ['./record-row-icon.component.scss'],
})
export class RecordRowIconComponent {
	icon = input.required<GeneratedRecordRowIcon>();
	fileExtension = input<string | undefined>();

	readonly iconUrl = computed(() => ICON_URLS[this.icon()]);
	readonly showsExtension = computed(
		() => this.icon() === RecordRowIcon.FileType && !!this.fileExtension(),
	);
}
