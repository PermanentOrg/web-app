import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO, RecordVO } from '@models/index';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnDestroy {
  @Input() item: any;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

}
