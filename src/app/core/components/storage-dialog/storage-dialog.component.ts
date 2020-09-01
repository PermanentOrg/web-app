import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';

type StorageDialogTab = 'add' | 'history' | 'promo';

@Component({
  selector: 'pr-storage-dialog',
  templateUrl: './storage-dialog.component.html',
  styleUrls: ['./storage-dialog.component.scss']
})
export class StorageDialogComponent implements OnInit, IsTabbedDialog {
  activeTab: StorageDialogTab = 'add';
  constructor(
    private dialogRef: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  setTab(tab: StorageDialogTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
    this.dialogRef.close();
  }
}
