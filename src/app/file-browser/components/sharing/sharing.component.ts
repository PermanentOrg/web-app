import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.service';
import { RecordVO, FolderVO } from '@models/index';

@Component({
  selector: 'pr-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  public shareItem: RecordVO | FolderVO = null;
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private dialog: Dialog
  ) {
    this.shareItem = this.data.item as FolderVO | RecordVO;
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

}
