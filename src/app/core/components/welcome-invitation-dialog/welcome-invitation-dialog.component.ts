import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-welcome-invitation-dialog',
  templateUrl: './welcome-invitation-dialog.component.html',
  styleUrls: ['./welcome-invitation-dialog.component.scss']
})
export class WelcomeInvitationDialogComponent implements OnInit {
  public archiveName: string;
  public accessRole: string;
  public accessArticle: string = 'a';

  constructor(
    private dialogRef: DialogRef,
    private account: AccountService,
    private constants: PrConstantsService
  ) { }

  ngOnInit(): void {
    const archive = this.account.getArchive();
    this.archiveName = archive.fullName;
    this.accessRole = this.constants.translate(archive.accessRole);
    this.accessArticle = this.accessRole.charAt(0).match(/[aeiou]/i) ? 'an' : 'a';
  }

  public getRoleDescription(): string {
    const archive = this.account.getArchive();
    switch(archive.accessRole) {
      case 'access.role.contributor':
        return 'view, create, and upload';
      case 'access.role.editor':
        return 'view, create, upload, and edit';
      case 'access.role.curator':
        return 'view, create, upload, edit, delete, and move';
      case 'access.role.manager':
      case 'access.role.owner':
        return 'view, create, upload, edit, delete, move, share, and publish';
      default:
        return 'view';
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}
