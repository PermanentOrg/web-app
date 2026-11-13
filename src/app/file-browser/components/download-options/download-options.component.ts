import { Component, computed, inject, input } from '@angular/core';
import { RecordVO } from '@models';
import { DataService } from '@shared/services/data/data.service';

type DownloadOption = ReturnType<RecordVO['getDownloadOptionsList']>[number];

@Component({
	selector: 'pr-download-options',
	standalone: true,
	templateUrl: './download-options.component.html',
	styleUrls: ['./download-options.component.scss'],
})
export class DownloadOptionsComponent {
	private readonly data = inject(DataService);

	readonly record = input.required<RecordVO>();
	readonly options = computed(() => this.record().getDownloadOptionsList());

	download(option: DownloadOption) {
		this.data.downloadFile(this.record(), {
			format: option.format,
			type: option.name,
		});
	}
}
