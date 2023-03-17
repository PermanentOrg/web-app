import { ArchiveVO, ArchiveType } from '@models/archive-vo';
import { Component, Inject, OnInit } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-archive-type-change-dialog',
  templateUrl: './archive-type-change-dialog.component.html',
  styleUrls: ['./archive-type-change-dialog.component.scss'],
})
export class ArchiveTypeChangeDialogComponent implements OnInit {
  archive: ArchiveVO;
  archiveType: ArchiveType;
  setArchiveType:(value: string)=>void;
  public updating = false

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    @Inject(DIALOG_DATA) public data: any
  ) {
    this.archive = this.data.archive;
    this.archiveType = this.data.archiveType;
    this.setArchiveType = this.data.setArchiveType;
  }

  ngOnInit(): void {}

  public onDoneClick(): void {
    this.setArchiveType(this.archive.type)
    this.dialogRef.close();
  }

  public async onConfirmClick(){
    this.archive.type = this.archiveType;
    this.updating = true;
    try {
      await this.api.archive.update(this.archive);
    }
    catch {
      // fail silently
    }
    finally {
      this.updating = false;
      this.dialogRef.close();
    }
  }
}
