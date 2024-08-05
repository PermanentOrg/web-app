import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DialogRef } from '@angular/cdk/dialog';

export const PROFILE_ONBOARDING_COOKIE = 'hasSeenProfileMessage';

@Component({
  selector: 'pr-profile-edit-first-time-dialog',
  templateUrl: './profile-edit-first-time-dialog.component.html',
  styleUrls: ['./profile-edit-first-time-dialog.component.scss']
})
export class ProfileEditFirstTimeDialogComponent implements OnInit {

  constructor(
    private dialogRef: DialogRef,
    private cookies: CookieService
  ) { }

  ngOnInit(): void {
    this.cookies.set(PROFILE_ONBOARDING_COOKIE, 'true', new Date('01-01-2030'));
  }

  close(): void {
    this.dialogRef.close();
  }

}
