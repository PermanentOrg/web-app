import { Component, computed, inject, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { RecordVO } from '@models';
import {
	RecordPreviewState,
	getRecordPreviewState,
} from '@models/record-preview-state';
import { DataService } from '@shared/services/data/data.service';
import { getRecordTypeIconUrl } from '../record-type-thumbnail/record-type-icon-url';

const UNKNOWN_EXTENSION_LABEL = 'unknown';

@Component({
	selector: 'pr-download-options',
	standalone: true,
	imports: [FontAwesomeModule],
	templateUrl: './download-options.component.html',
	styleUrls: ['./download-options.component.scss'],
})
export class DownloadOptionsComponent {
	private readonly data = inject(DataService);

	readonly record = input.required<RecordVO>();

	readonly options = computed(() =>
		this.record()
			.getDownloadOptionsList()
			.map((option) => ({
				name: option.name,
				label: option.label,
				extensionLabel:
					option.extension && option.extension !== 'null'
						? option.extension
						: UNKNOWN_EXTENSION_LABEL,
			})),
	);

	readonly recordTypeIconMask = computed(
		() => `url(${getRecordTypeIconUrl(this.record().type)})`,
	);

	readonly isProcessing = computed(
		() => getRecordPreviewState(this.record()) === RecordPreviewState.Preparing,
	);

	readonly processingIcon = faHourglassHalf;

	download(fileName: string) {
		this.data.downloadFile(this.record(), fileName);
	}
}
