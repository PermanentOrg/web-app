import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { RelationVO, ArchiveVO } from '@models/index';

export interface ArchivePickerComponentConfig {
  relations?: RelationVO[];
  hideRelations?: boolean;
}

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
    @Inject(DIALOG_DATA) public dialogData: ArchivePickerComponentConfig,
  ) {
    this.relations = this.dialogData.relations;
  }

  ngOnInit() {
  }

  chooseArchive(archive: ArchiveVO) {
    this.dialogRef.close(archive);
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
