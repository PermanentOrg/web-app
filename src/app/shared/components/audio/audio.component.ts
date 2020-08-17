import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { RecordVO } from '@models';
import { find } from 'lodash';

@Component({
  selector: 'pr-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnChanges {
  @Input() item: RecordVO;
  audioSrc: string;
  constructor() { }

  ngOnChanges(): void {
    const convertedFile = find(this.item.FileVOs, {format: 'file.format.converted'}) as any;
    const originalFile = find(this.item.FileVOs, {format: 'file.format.original'}) as any;

    if (convertedFile) {
      this.audioSrc = convertedFile.fileURL;
    } else if (originalFile) {
      this.audioSrc = originalFile.fileURL;
    }
  }

}
