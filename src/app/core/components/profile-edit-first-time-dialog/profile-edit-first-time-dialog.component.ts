import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@root/app/dialog/dialog.module';

@Component({
  selector: 'pr-profile-edit-first-time-dialog',
  templateUrl: './profile-edit-first-time-dialog.component.html',
  styleUrls: ['./profile-edit-first-time-dialog.component.scss']
})
export class ProfileEditFirstTimeDialogComponent implements OnInit {

  constructor(
    private dialogRef: DialogRef
  ) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

}
