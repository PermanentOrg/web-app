import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';

@Component({
  selector: 'pr-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent implements OnInit {

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  onDoneClick() {
    this.dialogRef.close();
  }

}
