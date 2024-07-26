/* @format */
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { DeviceService } from '@shared/services/device/device.service';

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
