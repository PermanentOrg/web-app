import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import { ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Component({
  selector: 'pr-archive-small',
  templateUrl: './archive-small.component.html',
  styleUrls: ['./archive-small.component.scss']
})
export class ArchiveSmallComponent implements OnInit, OnChanges {
  @Input() archive: ArchiveVO = null;
  @Input() clickable = false;
  @Input() relation: string;
  @Input() accessRole: string;
  @Input() isPending = false;

  public isCurrent = false;
  public relationDisplay: string;
  public accessRoleDisplay: string;

  constructor(
    private account: AccountService,
    private prConstants: PrConstantsService
  ) { }

  ngOnInit() {
    const currentArchive = this.account.getArchive();
    if (currentArchive) {
      this.isCurrent = this.account.getArchive().archiveId === this.archive.archiveId;
    } else {
      this.isCurrent = false;
    }

    if (!this.isPending) {
      this.isPending = this.archive && this.archive.isPending();
    }

    if (this.relation) {
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.relation) {
      if (this.relation) {
        this.relationDisplay = this.prConstants.translate(this.relation);
      } else {
        this.relationDisplay = null;
      }
    }

    if (changes.accessRole) {
      if (this.accessRole) {
        this.accessRoleDisplay = this.prConstants.translate(this.accessRole);
      } else {
        this.accessRoleDisplay = null;
      }
    }
  }

}
