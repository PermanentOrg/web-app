import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { RelationVO, ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-archive-picker',
  templateUrl: './archive-picker.component.html',
  styleUrls: ['./archive-picker.component.scss']
})
export class ArchivePickerComponent implements OnInit {
  relations: RelationVO[];
  searchResults: ArchiveVO[];

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public dialogData: any,
  ) {
    this.relations = this.dialogData.relations;
  }

  ngOnInit() {
  }

  chooseArchive(archive: ArchiveVO) {
    this.dialogRef.close(archive);
  }

  close() {
    this.dialogRef.close();
  }

}
