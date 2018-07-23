import { Component, OnInit, Input } from '@angular/core';

import { FolderVO, RecordVO } from '@models/index';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit {
  @Input() item: any;

  constructor() { }

  ngOnInit() {
    console.log('file-list-item.component.ts', 16, this.item.isRecord);
  }

}
