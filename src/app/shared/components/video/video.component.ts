import { Component, OnInit, Input } from '@angular/core';

import { RecordVO } from '@root/app/models';

@Component({
  selector: 'pr-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  @Input() item: RecordVO;

  public videoSrc: string;

  constructor() { }

  ngOnInit() {
    const fileVO = this.item.FileVOs[0];
    console.log('video.component.ts', 19, this.item.imageRatio);
    this.videoSrc = fileVO.fileURL;
  }

}
