import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-archive-switcher-dialog',
  templateUrl: './archive-switcher-dialog.component.html',
  styleUrls: ['./archive-switcher-dialog.component.scss']
})
export class ArchiveSwitcherDialogComponent implements OnInit {
  public loadingArchives = true;
  public archives: ArchiveVO[] = [];
  public currentArchive: ArchiveVO;

  public waiting = false;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private account: AccountService
  ) {
    this.currentArchive = this.account.getArchive();

    this.account.refreshArchives()
      .then((archives) => {
        this.archives = archives.filter(archive => archive.archiveId !== this.currentArchive.archiveId);
        this.loadingArchives = false;
      });
  }

  ngOnInit() {
  }

  async onArchiveClick(archive: ArchiveVO) {
    if (!this.waiting) {
      await this.account.changeArchive(archive);
      this.close();
    }
  }

  async logOut() {
    this.waiting = true;
    await this.account.logOut();
    this.cancel();
    this.waiting = false;
  }

  close() {
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
