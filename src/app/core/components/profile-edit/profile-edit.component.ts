import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ArchiveVO } from '@models';
import { ProfileItemVOData, FieldNameUI } from '@models/profile-item-vo';
import { ActivatedRoute } from '@angular/router';
import { groupBy } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';
import { UploadService } from '@core/services/upload/upload.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { PromptService } from '@shared/services/prompt/prompt.service';

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
    private upload: UploadService,
    private prompt: PromptService,
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

  onSaveStringProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsStringDataCol, value: string) {
    console.log(fieldName, value);
  }

  onSaveIntProfileItem(fieldName: FieldNameUI, dataCol: ProfileItemsIntDataCol, value: number) {
    console.log(fieldName, value);
  }

  onProfilePictureClick() {
    const privateRoot = this.account.getPrivateRoot();
    try {
      this.folderPicker.chooseRecord(privateRoot);
    } catch (err) {
    }
  }

  promptForExistingPicture() {
  }
}
