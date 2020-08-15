import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';
import { ArchiveVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';

type MyArchivesTab = 'switch' | 'new' | 'pending';

@Component({
  selector: 'pr-my-archives-dialog',
  templateUrl: './my-archives-dialog.component.html',
  styleUrls: ['./my-archives-dialog.component.scss']
})
export class MyArchivesDialogComponent implements OnInit, IsTabbedDialog {
  activeTab: MyArchivesTab = 'switch';

  archives: ArchiveVO[];
  constructor(
    private dialogRef: DialogRef,
    private accountService: AccountService,
    private router: Router
  ) {
    this.archives = this.accountService.getArchives();
  }

  ngOnInit(): void {
  }

  setTab(tab: MyArchivesTab) {
    this.activeTab = tab;
  }

  onDoneClick(): void {
    this.dialogRef.close();
  }

  async onArchiveClick(archive: ArchiveVO) {
    try {
      await this.accountService.changeArchive(archive);
      this.onDoneClick();
    } catch (err) {}
  }

}
