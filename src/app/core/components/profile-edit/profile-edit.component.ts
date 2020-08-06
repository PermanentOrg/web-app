import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ArchiveVO, RecordVO } from '@models';
import { ProfileItemVOData, FieldNameUI } from '@models/profile-item-vo';
import { ActivatedRoute } from '@angular/router';
import { groupBy } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { Dialog, DIALOG_DATA, IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';

type ProfileItemsStringDataCol =
'string1' |
'string2' |
'string3' |
'datetime1' |
'datetime2' |
'textData1' |
'textData2' |
'day1' |
'day2'
;

type ProfileItemsIntDataCol =
'int1' |
'int2' |
'int3' |
'locnId1' |
'locnId2' |
'otherId1' |
'otherId2' |
'text_dataId1' |
'text_dataId2'
;

type ProfileItemsDataCol = ProfileItemsStringDataCol | ProfileItemsIntDataCol;

type ProfileItemsDictionary = {
  [Field in FieldNameUI]: ProfileItemVOData[]
};

type ProfileTab = 'about' | 'info' | 'online' | 'residence' | 'work';

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, IsTabbedDialog {
  archive: ArchiveVO;
  profileItems: ProfileItemsDictionary;

  canEdit: boolean;

  activeTab: ProfileTab = 'about';
  constructor(
    private account: AccountService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private api: ApiService,
    private message: MessageService
  ) {
    this.archive = this.account.getArchive();
    const profileItems = this.data.profileItems as ProfileItemVOData[];
    this.profileItems = groupBy(profileItems, 'fieldNameUI') as ProfileItemsDictionary;

    this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
  }

  ngOnInit(): void {
  }

  setTab(tab: ProfileTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  async onSaveStringProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsStringDataCol, value: string) {
    let profileItem = this.profileItems[fieldName]?.[0];
    let isNew = false;

    if (!profileItem) {
      const type = fieldName.replace('profile.', 'profile_item.');
      profileItem = {
        fieldNameUI: fieldName,
        archiveId: this.archive.archiveId,
        type
      };
      isNew = true;
    }

    const originalValue = profileItem[dataCol];
    profileItem[dataCol] = value;

    try {
      if (isNew) {
        this.profileItems[fieldName] = [ profileItem ];
      }
      const response = await this.api.archive.addUpdateProfileItem(profileItem);
      if (isNew) {
        const newProfileItem = response.getProfileItemVOs()[0];
        profileItem.profile_itemId = newProfileItem.profile_itemId;
      }
    } catch (err) {
      if (!isNew) {
        profileItem[dataCol] = originalValue;
      } else {
        this.profileItems[fieldName] = null;
      }
    }
  }

  onSaveIntProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsIntDataCol, value: number) {
  }
}
