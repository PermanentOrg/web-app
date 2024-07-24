/* @format */
<<<<<<< HEAD
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
=======
import { Component, OnInit, Input, Inject } from '@angular/core';
>>>>>>> d2092361 (removed the old dialog)
import { DeviceService } from '@shared/services/device/device.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-create-account-dialog',
  templateUrl: './create-account-dialog.component.html',
  styleUrls: ['./create-account-dialog.component.scss'],
})
export class CreateAccountDialogComponent {
  sharerName: string = this.data.sharerName;

  constructor(
    private dialogRef: DialogRef,
    private device: DeviceService,
    @Inject(DIALOG_DATA) public data: any,
  ) {}

  isMobile(): boolean {
    return this.device.isMobileWidth();
  }

  close(): void {
    this.dialogRef.close();
  }
}
