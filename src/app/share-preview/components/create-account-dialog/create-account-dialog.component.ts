/* @format */
import { Component, Inject, OnInit } from '@angular/core';
import { DeviceService } from '@shared/services/device/device.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-create-account-dialog',
  templateUrl: './create-account-dialog.component.html',
  styleUrls: ['./create-account-dialog.component.scss'],
})
export class CreateAccountDialogComponent implements OnInit {
  sharerName: string = this.data.sharerName;

  constructor(
    private dialogRef: DialogRef,
    private device: DeviceService,
    private route: ActivatedRoute,
    @Inject(DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    const url = window.location.href;
    const token = url.split('/').pop();
    localStorage.setItem('shareToken', token);
  }

  isMobile(): boolean {
    return this.device.isMobileWidth();
  }

  close(): void {
    this.dialogRef.close();
  }
}
