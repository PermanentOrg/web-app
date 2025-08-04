/* @format */
import { Observable } from 'rxjs';
import { ArchiveVO, ArchiveType } from '@models/archive-vo';
import { Component, Inject } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-archive-type-change-dialog',
  templateUrl: './archive-type-change-dialog.component.html',
  styleUrls: ['./archive-type-change-dialog.component.scss'],
  standalone: false,
})
export class ArchiveTypeChangeDialogComponent {
  archive: ArchiveVO;
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
