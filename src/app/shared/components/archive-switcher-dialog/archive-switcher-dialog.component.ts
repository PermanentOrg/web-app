import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';

@Component({
  selector: 'pr-archive-switcher-dialog',
  templateUrl: './archive-switcher-dialog.component.html',
  styleUrls: ['./archive-switcher-dialog.component.scss']
})
export class ArchiveSwitcherDialogComponent implements OnInit {

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit() {
  }

  select() {
    this.dialogRef.close(null);
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
