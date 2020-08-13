import { Injectable, Optional } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { RecordVO, ArchiveVO } from '@models';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { MessageService } from '../message/message.service';
import { FieldNameUI, ProfileItemVOData, ProfileItemVODictionary } from '@models/profile-item-vo';
import { PrConstantsService } from '../pr-constants/pr-constants.service';

@Injectable()
export class ProfileService {
  private profileItemDictionary: ProfileItemVODictionary = {};

  constructor(
    private api: ApiService,
    private constants: PrConstantsService,
    private account: AccountService,
    private folderPicker: FolderPickerService,
    private message: MessageService
  ) { }

  async promptForProfilePicture() {
    const privateRoot = this.account.getPrivateRoot();
    try {
      const currentArchive = this.account.getArchive();
      const record = (await this.folderPicker.chooseRecord(privateRoot)) as RecordVO;
      const updateArchive = new ArchiveVO(currentArchive);
      updateArchive.thumbArchiveNbr = record.archiveNbr;
      const updateResponse = await this.api.archive.update(updateArchive);
      currentArchive.update(updateResponse.getArchiveVO());

      // borrow thumb URLs from record for now, until they can be regenerated
      const thumbProps: Array<keyof (ArchiveVO|RecordVO)> = ['thumbURL200', 'thumbURL500', 'thumbURL1000', 'thumbURL2000'];
      for (const prop of thumbProps) {
        currentArchive[prop] = record[prop];
      }
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError('There was a problem changing the archive profile picture.');
      }
    }
  }

  async fetchProfileItems() {
    const currentArchive = this.account.getArchive();
    const profileResponse = await this.api.archive.getAllProfileItems(currentArchive);
    const profileItems = profileResponse.getProfileItemVOs();
    for (const item of profileItems) {
      this.addProfileItemToDictionary(item);
    }
  }

  getProfileItemDictionary() {
    return this.profileItemDictionary;
  }

  clearProfileDictionary() {
    this.profileItemDictionary = {};
  }

  async addProfileItemToDictionary(item: ProfileItemVOData) {
    const fieldNameUIShort = item.fieldNameUI.replace('profile.', '');

    if (!this.profileItemDictionary[fieldNameUIShort]) {
      this.profileItemDictionary[fieldNameUIShort] = [ item ];
    } else {
      this.profileItemDictionary[fieldNameUIShort].push(item);
    }
  }

  async saveProfileItem(item: ProfileItemVOData, valueWhitelist?: (keyof ProfileItemVOData)[]) {
    let updateItem = item;
    if (valueWhitelist) {
      updateItem = {
        profile_itemId: item.profile_itemId
      };

      for (const value of valueWhitelist) {
        (updateItem as any)[value] = item[value];
      }
    }
    const response = await this.api.archive.addUpdateProfileItem(item);
    const updated = response.getProfileItemVOs()[0];
    item.updatedDT = updated.updatedDT;
  }

  getSpecificFieldNameUIFromValueKey(field: FieldNameUI, valueKey: keyof ProfileItemVOData) {
    const template = this.constants.getProfileTemplate();
    const currentArchive = this.account.getArchive();
    const shortType = currentArchive.type.split('.').pop();
    const shortField = field.split('.').pop();
    const templateForType = template[shortType];
    const valueTemplate = templateForType[shortField].values[valueKey];
    return valueTemplate.field_name_ui;
  }
}
