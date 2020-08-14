import { Component, OnInit, Inject } from '@angular/core';
import { FolderVO, ArchiveVO, RecordVO } from '@models';
import { ProfileItemVOData, FieldNameUI, ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role.enum';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse, FolderResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { EditService } from '@core/services/edit/edit.service';
import { ProfileService, ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { collapseAnimation, ngIfScaleAnimationDynamic } from '@shared/animations';
import debug from 'debug';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';

type ProfileSection = 'about' | 'info' | 'online' | 'residence' | 'work';

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  animations: [ collapseAnimation, ngIfScaleAnimationDynamic ]
})
export class ProfileEditComponent implements OnInit {
  archive: ArchiveVO;
  publicRoot: FolderVO;
  profileItems: ProfileItemVODictionary;

  canEdit: boolean;

  isPublic = true;

  sectionState: { [key in ProfileSection ]: 'open' | 'closed'} = {
    about: 'open',
    info: 'open',
    online: 'open',
    residence: 'open',
    work: 'open'
  };

  fieldPlacholders = {
    address: 'Choose a location',
    phone: '555-555-5555',
  };

  private debug = debug('component:profileEdit');

  constructor(
    private account: AccountService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private dialog: Dialog,
    private api: ApiService,
    private edit: EditService,
    private folderPicker: FolderPickerService,
    private profile: ProfileService,
    private prompt: PromptService,
    private message: MessageService
  ) {
    this.archive = this.account.getArchive();
    this.publicRoot = new FolderVO(this.account.getPublicRoot());

    this.profileItems = this.profile.getProfileItemDictionary();

    this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
  }

  ngOnInit(): void {
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
    item.isPendingAction = true;
    try {
      if (this.profile.isItemEmpty(item)) {
        this.debug('item is empty, attempting delete %o', item);
        if (item.profile_itemId) {
          await this.profile.deleteProfileItem(item);
        }
      } else {
        await this.profile.saveProfileItem(item, [valueKey]);
      }
      if (refreshArchive) {
        await this.account.refreshArchive();
      }
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        item[valueKey] = originalValue as never;
        this.message.showError(err.getMessage(), true);
      }
    } finally {
      item.isPendingAction = false;
    }
  }

  async onRemoveProfileItemClick(item: ProfileItemVOData) {
    const deferred = new Deferred();
    try {
      if (!this.profile.isItemEmpty(item)) {
        await this.prompt.confirm(
          'Remove',
          'Remove this item?',
          deferred.promise,
          'btn-danger'
        );
      }
      await this.profile.deleteProfileItem(item);
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError(err.getMessage(), true);
      }
    } finally {
      deferred.resolve();
    }
  }

  toggleSection(sectionName: ProfileSection) {
    if (this.sectionState[sectionName] === 'open') {
      this.sectionState[sectionName] = 'closed';
    } else {
      this.sectionState[sectionName] = 'open';
    }
  }

  addEmptyProfileItem(fieldNameShort: FieldNameUIShort) {
    const empty = this.profile.createEmptyProfileItem(fieldNameShort);
    empty.isNewlyCreated = true;
    this.profile.addProfileItemToDictionary(empty);
  }

  async chooseLocationForItem(item: ProfileItemVOData) {
    this.dialog.open('LocationPickerComponent', { profileItem: item }, { height: 'auto', width: '600px' } );
  }
}
