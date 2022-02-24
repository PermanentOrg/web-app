import { Component, OnInit } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { AccountService } from '@shared/services/account/account.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Component({
  selector: 'pr-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss']
})
export class WelcomeDialogComponent implements OnInit {
  public archiveName: string;
  public accessRole: string;

  constructor(
    private dialogRef: DialogRef,
    private account: AccountService,
    private constants: PrConstantsService
  ) { }

  ngOnInit(): void {
    const archive = this.account.getArchive();
    this.archiveName = archive.fullName;
    this.accessRole = this.constants.translate(archive.accessRole);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
