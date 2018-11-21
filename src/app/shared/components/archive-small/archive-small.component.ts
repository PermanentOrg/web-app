import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import { ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-archive-small',
  templateUrl: './archive-small.component.html',
  styleUrls: ['./archive-small.component.scss']
})
export class ArchiveSmallComponent implements OnInit, OnChanges {
  @Input() archive: ArchiveVO = null;
  @Input() clickable = false;

  public isCurrent = false;
  public isPending = false;

  constructor(private account: AccountService) { }

  ngOnInit() {
    this.isCurrent = this.account.getArchive().archiveId === this.archive.archiveId;
    this.isPending = this.archive.isPending();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

}
