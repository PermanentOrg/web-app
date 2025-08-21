import { Component, Input, OnChanges } from '@angular/core';
import { RecordVO } from '@models';
import { GetAccessFile } from '@models/get-access-file';

@Component({
	selector: 'pr-audio',
	templateUrl: './audio.component.html',
	styleUrls: ['./audio.component.scss'],
	standalone: false,
})
export class AudioComponent implements OnChanges {
	@Input() item: RecordVO;
	audioSrc: string;

	ngOnChanges(): void {
		this.audioSrc = GetAccessFile(this.item)?.fileURL;
	}
}
