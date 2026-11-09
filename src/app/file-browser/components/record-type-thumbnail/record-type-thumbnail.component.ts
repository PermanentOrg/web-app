import { Component, computed, input } from '@angular/core';

const ICON_DIRECTORY = 'assets/svg/record-type-thumbnail';

const ICON_FILE_BY_RECORD_TYPE: Record<string, string> = {
	'type.record.image': 'image.svg',
	'type.record.video': 'video.svg',
	'type.record.audio': 'audio.svg',
	'type.record.document': 'document.svg',
	'type.record.pdf': 'document.svg',
	'type.record.presentation': 'document.svg',
	'type.record.spreadsheet': 'document.svg',
	'type.record.archive': 'archive.svg',
};

const UNSUPPORTED_ICON_FILE = 'unsupported.svg';

@Component({
	selector: 'pr-record-type-thumbnail',
	standalone: true,
	templateUrl: './record-type-thumbnail.component.html',
	styleUrls: ['./record-type-thumbnail.component.scss'],
})
export class RecordTypeThumbnailComponent {
	recordType = input.required<string>();

	readonly iconUrl = computed(() => {
		const iconFile =
			ICON_FILE_BY_RECORD_TYPE[this.recordType()] ?? UNSUPPORTED_ICON_FILE;
		return `${ICON_DIRECTORY}/${iconFile}`;
	});
}
