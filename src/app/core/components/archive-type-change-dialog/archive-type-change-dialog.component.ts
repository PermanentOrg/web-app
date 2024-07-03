/* @format */
import { Observable } from 'rxjs';
import { ArchiveVO, ArchiveType } from '@models/archive-vo';
<<<<<<< HEAD
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
=======
import { Component, Inject, OnInit } from '@angular/core';
>>>>>>> 0ae01acc (used the cdk dialog inside the archive type change)
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-archive-type-change-dialog',
  templateUrl: './archive-type-change-dialog.component.html',
  styleUrls: ['./archive-type-change-dialog.component.scss'],
})
<<<<<<< HEAD
export class ArchiveTypeChangeDialogComponent {
  archive: ArchiveVO;
=======
export class ArchiveTypeChangeDialogComponent implements OnInit {
>>>>>>> 0ae01acc (used the cdk dialog inside the archive type change)
  archiveType: ArchiveType;
  public updating = false;

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    @Inject(DIALOG_DATA) public data: any,
    private msg: MessageService,
  ) {
    this.archiveType = this.data.archiveType;
  }

  public onDoneClick(): void {
    this.dialogRef.close(this.data.archiveType);
  }

  public async onConfirmClick() {
    this.dialogRef.close(this.archiveType);
  }
}
