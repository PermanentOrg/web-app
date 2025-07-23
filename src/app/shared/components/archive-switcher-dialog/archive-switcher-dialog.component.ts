/* @format */
import { Component, Inject } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models';

import { orderBy } from 'lodash';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-archive-switcher-dialog',
  templateUrl: './archive-switcher-dialog.component.html',
  styleUrls: ['./archive-switcher-dialog.component.scss'],
  standalone: false,
})
export class ArchiveSwitcherDialogComponent {
  public loadingArchives = false;
  public archives: ArchiveVO[] = [];
  public currentArchive: ArchiveVO;

  public waiting = false;

  public promptText: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private account: AccountService,
  ) {
    this.archives = orderBy(this.account.getArchives(), (a) =>
      a.fullName.toLowerCase(),
    );

    this.promptText = data.promptText;
  }

  async onArchiveClick(archive: ArchiveVO) {
    if (!this.waiting) {
      this.waiting = true;
      try {
        await this.account.changeArchive(archive);
        this.close();
      } catch (err) {
      } finally {
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
    this.dialogRef.close();
  }
}
