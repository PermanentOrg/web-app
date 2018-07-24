import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO, RecordVO } from '@models/index';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnDestroy {
  @Input() item: FolderVO | RecordVO;

  constructor(private dataService: DataService, private router: Router) {
  }

  goToItem() {
    if (this.item.isFolder) {
      console.log(this.item.archiveNbr, this.item.folder_linkId);
      // this.router.navigate(['/myfiles'])
    }
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

}
