import { Component, OnInit } from '@angular/core';
import { RecordVO, FolderVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-public-item',
  templateUrl: './public-item.component.html',
  styleUrls: ['./public-item.component.scss']
})
export class PublicItemComponent implements OnInit {
  public isVideo = false;
  public showThumbnail = true;
  public record: RecordVO;
  public folder: FolderVO;

  constructor(route: ActivatedRoute) {
    if (route.snapshot.data.publishedItem.recordId) {
      // record
      this.record = route.snapshot.data.publishedItem;
    } else {
      // folder
      this.folder = route.snapshot.data.publishedItem;
    }
  }

  ngOnInit() {
  }

  initRecord() {
    this.isVideo = this.record.type.includes('video');
  }

}
