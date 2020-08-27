import { Component, OnInit, Inject } from '@angular/core';
import { FolderVO, ArchiveVO } from '@models';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { findRouteData } from '@shared/utilities/router';
import { ProfileItemVOData } from '@models/profile-item-vo';

@Component({
  selector: 'pr-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  publicRoot: FolderVO;
  profileItems: ProfileItemVOData[];
  archive: ArchiveVO;
  constructor(
    private route: ActivatedRoute,
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
  ) {
  }

  ngOnInit(): void {
    this.publicRoot = this.data.publicRoot;
    this.profileItems = this.data.profileItems;
    this.archive = this.data.archive;
  }

  close(): void {
    this.dialogRef.close();
  }

}
