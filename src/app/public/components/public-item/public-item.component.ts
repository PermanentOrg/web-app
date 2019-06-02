import { Component, OnInit } from '@angular/core';
import { RecordVO } from '@models/record-vo';
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

  constructor(route: ActivatedRoute) {
    this.record = route.snapshot.data.currentRecord;
    console.log(route.snapshot.data);
  }

  ngOnInit() {
  }

  initRecord() {
    this.isVideo = this.record.type.includes('video');
  }

}
