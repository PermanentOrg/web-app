import { Component, OnInit, Inject } from '@angular/core';
import { FolderVO, ArchiveVO, RecordVO } from '@models';
import { ProfileItemVOData, FieldNameUI, ProfileItemVODictionary } from '@models/profile-item-vo';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse, FolderResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DIALOG_DATA, IsTabbedDialog, DialogRef } from '@root/app/dialog/dialog.module';
import { EditService } from '@core/services/edit/edit.service';
import { ProfileService } from '@shared/services/profile/profile.service';

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

type ProfileTab = 'info' | 'online' | 'residence' | 'work';

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit, IsTabbedDialog {
  archive: ArchiveVO;
  publicRoot: FolderVO;
  profileItems: ProfileItemVODictionary;

  canEdit: boolean;

  isPublic = true;

  activeTab: ProfileTab = 'info';
  constructor(
    private account: AccountService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private api: ApiService,
    private edit: EditService,
    private folderPicker: FolderPickerService,
    private profile: ProfileService,
    private message: MessageService
  ) {
    this.archive = this.account.getArchive();
    this.publicRoot = new FolderVO(this.account.getPublicRoot());

    this.profileItems = this.profile.getProfileItemDictionary();

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

  async onProfilePictureClick() {
    this.profile.promptForProfilePicture();
  }

  async chooseBannerPicture() {
    const originalValue = this.publicRoot.thumbArchiveNbr;
    try {
      const record = await this.folderPicker.chooseRecord(this.account.getRootFolder());
      this.publicRoot.thumbArchiveNbr = record.archiveNbr;
      await this.edit.updateItems([this.publicRoot]);
    } catch (err) {
      if (err instanceof FolderResponse) {
        this.publicRoot.thumbArchiveNbr = originalValue;
        console.error('error updating!');
      }
    }
  }

  async onSaveProfileItem(item: ProfileItemVOData, valueKey: ProfileItemsDataCol, newValue: any, refreshArchive = false) {
    const originalValue = item[valueKey];
    item[valueKey] = newValue as never;
    try {
      await this.profile.saveProfileItem(item, [valueKey]);
      if (refreshArchive) {
        await this.account.refreshArchive();
      }
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        item[valueKey] = originalValue as never;
        this.message.showError(err.getMessage(), true);
      }
    }
  }
}
