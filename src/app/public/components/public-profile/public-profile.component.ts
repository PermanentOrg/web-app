import { Component, OnInit, Inject, Optional, HostBinding } from '@angular/core';
import { FolderVO, ArchiveVO } from '@models';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { findRouteData } from '@shared/utilities/router';
import { ProfileItemVOData, ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';

@Component({
  selector: 'pr-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  @HostBinding('class.is-dialog') isDialog: boolean;

  publicRoot: FolderVO;
  archive: ArchiveVO;

  profileItems: ProfileItemVODictionary = {};

  constructor(
    private route: ActivatedRoute,
    @Optional() @Inject(DIALOG_DATA) public data: any,
    @Optional() private dialogRef: DialogRef,
  ) {
    this.isDialog = dialogRef ? true : false;
  }

  ngOnInit(): void {
    const data = this.data || this.route.snapshot.data;

    this.publicRoot = data.publicRoot;
    this.archive = data.archive;
    this.buildProfileItemDictionary(data.profileItems);
  }

  close(): void {
    this.dialogRef?.close();
  }

  buildProfileItemDictionary(items: ProfileItemVOData[]) {
    this.profileItems = {};

    for (const item of items) {
      this.addProfileItemToDictionary(item);
    }
  }

  addProfileItemToDictionary(item: ProfileItemVOData) {
    const fieldNameUIShort = item.fieldNameUI.replace('profile.', '');

    if (!this.profileItems[fieldNameUIShort]) {
      this.profileItems[fieldNameUIShort] = [ item ];
    } else {
      this.profileItems[fieldNameUIShort].push(item);
    }

    if (item.textData1) {
      item.textData1 = '<p>' + this.archive.description.replace(new RegExp('\n', 'g'), '</p><p>') + '</p>';
    }
  }

  hasSingleValueFor(field: FieldNameUIShort, column: ProfileItemsDataCol) {
    return this.profileItems[field]?.length && this.profileItems[field][0][column];
  }

}
