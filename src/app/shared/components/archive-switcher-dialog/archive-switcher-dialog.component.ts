import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models/index';

import { orderBy } from 'lodash';

@Component({
  selector: 'pr-archive-switcher-dialog',
  templateUrl: './archive-switcher-dialog.component.html',
  styleUrls: ['./archive-switcher-dialog.component.scss']
})
export class ArchiveSwitcherDialogComponent implements OnInit {
  public loadingArchives = false;
  public archives: ArchiveVO[] = [];
  public currentArchive: ArchiveVO;

  public waiting = false;

  public promptText: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private account: AccountService
  ) {
    this.archives = orderBy(this.account.getArchives(), 'fullName');

    this.promptText = data.promptText;
  }

  ngOnInit() {
  }

  async onArchiveClick(archive: ArchiveVO) {
    if (!this.waiting) {
      this.waiting = true;
      try {
        await this.account.changeArchive(archive);
        this.close();
      } catch (err) {}
      finally {
        this.waiting = false;
      }
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
