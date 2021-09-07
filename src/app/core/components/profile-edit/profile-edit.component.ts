import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { FolderVO, ArchiveVO, RecordVO } from '@models';
import { ProfileItemVOData, FieldNameUI, ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse, FolderResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { EditService } from '@core/services/edit/edit.service';
import { ProfileService, ProfileItemsDataCol, ALWAYS_PUBLIC } from '@shared/services/profile/profile.service';
import { collapseAnimation, ngIfScaleAnimationDynamic } from '@shared/animations';
import debug from 'debug';
import { PromptService, READ_ONLY_FIELD } from '@shared/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { some } from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { PROFILE_ONBOARDING_COOKIE } from '../profile-edit-first-time-dialog/profile-edit-first-time-dialog.component';
import { copyFromInputElement } from '@shared/utilities/forms';

@Component({
  selector: 'pr-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  animations: [ collapseAnimation, ngIfScaleAnimationDynamic ]
})
export class ProfileEditComponent implements OnInit, AfterViewInit {
  archive: ArchiveVO;
  publicRoot: FolderVO;
  profileItems: ProfileItemVODictionary;

  canEdit: boolean;

  isPublic = true;

  fieldPlacholders = {
    address: 'Choose a location',
    phone: '555-555-5555',
  };

  totalProgress = 0;
  countUpOptions = {
    useEasing: true,
    useGrouping: false,
    separator: ',',
    decimal: '.',
    duration: 1,
    suffix: '%',
    startValue: 0
  };

  private debug = debug('component:profileEdit');

  constructor(
    private account: AccountService,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private dialog: Dialog,
    private api: ApiService,
    private folderPicker: FolderPickerService,
    private profile: ProfileService,
    private prompt: PromptService,
    private message: MessageService,
    private cookies: CookieService
  ) {
    this.archive = this.account.getArchive();
    this.publicRoot = new FolderVO(this.account.getPublicRoot());

    this.profileItems = this.profile.getProfileItemDictionary();
    this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
    this.checkProfilePublic();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateProgress();
      this.showFirstTimeDialog();
    });
  }

  showFirstTimeDialog() {
    if (this.cookies.check(PROFILE_ONBOARDING_COOKIE)) {
      return;
    }

    if (this.totalProgress >= 0.1) {
      return;
    }

    try {
      this.dialog.open('ProfileEditFirstTimeDialogComponent', null, { width: '760px', height: 'auto'});
    } catch (err) { }
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  updateProgress() {
    this.totalProgress = this.profile.calculateProfileProgress();
  }

  getProgressTransform() {
    return `transform: translateX(${(this.totalProgress * 100) - 100}%)`;
  }

  checkProfilePublic() {
    this.isPublic = this.profile.checkProfilePublic();
  }

  async onProfilePictureClick() {
    this.profile.promptForProfilePicture();
  }

  async chooseBannerPicture() {
    const originalValue = this.publicRoot.thumbArchiveNbr;
    try {
      const record = await this.folderPicker.chooseRecord(this.account.getPrivateRoot());
      const updateFolder = new FolderVO(this.publicRoot);
      updateFolder.thumbArchiveNbr = record.archiveNbr;
      await this.api.folder.updateRoot([updateFolder], ['thumbArchiveNbr', 'view', 'viewProperty']);
      // borrow thumb URLs from record for now, until they can be regenerated
      const thumbProps: Array<keyof (ArchiveVO|RecordVO)> = ['thumbURL200', 'thumbURL500', 'thumbURL1000', 'thumbURL2000'];
      for (const prop of thumbProps) {
        this.publicRoot[prop] = record[prop] as never;
      }
      this.publicRoot.thumbArchiveNbr = record.archiveNbr;
    } catch (err) {
      if (err instanceof FolderResponse) {
        this.publicRoot.thumbArchiveNbr = originalValue;
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
      this.updateProgress();
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
      this.updateProgress();
    }
  }

  async onProfilePublicChange(isPublic: boolean) {
    try {
      await this.profile.setProfilePublic(isPublic);
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError(err.getMessage(), true);
      }
      this.isPublic = !isPublic;
    }
  }

  addEmptyProfileItem(fieldNameShort: FieldNameUIShort) {
    const empty = this.profile.createEmptyProfileItem(fieldNameShort);
    empty.isNewlyCreated = true;
    this.profile.addProfileItemToDictionary(empty);
  }

  async chooseLocationForItem(item: ProfileItemVOData) {
    try {
      await this.dialog.open('LocationPickerComponent', { profileItem: item }, { height: 'auto', width: '600px' } );
    } finally {
      this.updateProgress();
    }
  }

  async onShareClick() {
    const url = `https://${location.host}/p/archive/${this.archive.archiveNbr}/profile`;
    const fields = [
      READ_ONLY_FIELD('profileLink', 'Profile link', url)
    ];

    const deferred = new Deferred();

    await this.prompt.prompt(fields, 'Share profile link', deferred.promise, 'Copy link');
    const input = this.prompt.getInput('profileLink');
    copyFromInputElement(input);
    deferred.resolve();
  }
}
