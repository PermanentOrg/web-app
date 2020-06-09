import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ArchiveVO, RecordVO } from '@models';
import { ProfileItemVOData, FieldNameUI } from '@models/profile-item-vo';
import { ActivatedRoute } from '@angular/router';
import { groupBy } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';
import { UploadService } from '@core/services/upload/upload.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

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

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  archive: ArchiveVO;
  profileItems: ProfileItemsDictionary;

  canEdit: boolean;

  constructor(
    private data: DataService,
    private account: AccountService,
    private route: ActivatedRoute,
    private api: ApiService,
    private message: MessageService,
    private folderPicker: FolderPickerService
  ) {
    this.data.setCurrentFolder(
      new FolderVO({
        type: 'page',
        displayName: 'Profile',
        pathAsText: ['Profile']
      })
    );

    this.archive = this.account.getArchive();
    const profileItems = this.route.snapshot.data.profileItems as ProfileItemVOData[];
    this.profileItems = groupBy(profileItems, 'fieldNameUI') as ProfileItemsDictionary;

    this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
  }

  ngOnInit(): void {
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
    console.log(fieldName, value);
  }

  async onProfilePictureClick() {
    const privateRoot = this.account.getPrivateRoot();
    try {
      const record = (await this.folderPicker.chooseRecord(privateRoot)) as RecordVO;
      const updateArchive = new ArchiveVO({...this.archive, thumbArchiveNbr: record.archiveNbr});
      const updateResponse = await this.api.archive.update(updateArchive);
      this.archive.update(updateResponse.getArchiveVO());
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError('There was a problem changing the archive profile picture.');
        console.error(err);
      }
    }
  }

  promptForExistingPicture() {
  }
}
