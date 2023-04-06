import { Observable } from 'rxjs';
import { ArchiveVO, ArchiveType } from '@models/archive-vo';
import { Component, Inject, OnInit } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-archive-type-change-dialog',
  templateUrl: './archive-type-change-dialog.component.html',
  styleUrls: ['./archive-type-change-dialog.component.scss'],
})
export class ArchiveTypeChangeDialogComponent implements OnInit {
  archive: ArchiveVO;
  archiveType: ArchiveType;
  archiveClose: Observable<void>;
  public updating = false;

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    @Inject(DIALOG_DATA) public data: any,
    private msg: MessageService
  ) {
    this.archive = this.data.archive;
    this.archiveType = this.data.archiveType;
    this.archiveClose = this.data.archiveClose;
  }

  ngOnInit(): void {}

  public onDoneClick(): void {
    this.archiveClose.subscribe();
    this.dialogRef.close();
  }

  public async onConfirmClick() {
    this.archive.type = this.archiveType;
    this.updating = true;
    try {
      await this.api.archive.update(this.archive);
    } catch {
      this.msg.showError(
        'There was an error changing the archive type. Please try again.'
      );
    } finally {
      this.updating = false;
      this.dialogRef.close();
    }
  }
}
