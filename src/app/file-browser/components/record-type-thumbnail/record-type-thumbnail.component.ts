import { Component, computed, input } from '@angular/core';
import { getRecordTypeIconUrl } from './record-type-icon-url';

@Component({
	selector: 'pr-record-type-thumbnail',
	standalone: true,
	templateUrl: './record-type-thumbnail.component.html',
	styleUrls: ['./record-type-thumbnail.component.scss'],
})
export class RecordTypeThumbnailComponent {
	recordType = input.required<string>();

	readonly iconUrl = computed(() => getRecordTypeIconUrl(this.recordType()));
}
