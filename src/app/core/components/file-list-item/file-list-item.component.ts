import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO, RecordVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnDestroy {
  @Input() item: FolderVO | RecordVO;

  constructor(private dataService: DataService, private router: Router, private activatedRoute: ActivatedRoute) {
  }

  goToItem() {
    if (this.item.dataStatus < DataStatus.Lean) {
      if (!this.item.isFetching) {
        this.dataService.fetchLeanItems([this.item]);
      }

      return this.item.fetched.then((fetched) => {
        this.goToItem();
      });
    }

    if (this.item.isFolder) {
      this.router.navigate(['/myfiles', this.item.archiveNbr, this.item.folder_linkId ]);
    } else {
      this.router.navigate(['record', this.item.archiveNbr], {relativeTo: this.activatedRoute});
    }
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

}
