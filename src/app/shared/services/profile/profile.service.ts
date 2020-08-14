import { Injectable, Optional } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { RecordVO, ArchiveVO } from '@models';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { MessageService } from '../message/message.service';
import { FieldNameUI, ProfileItemVOData, ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { PrConstantsService } from '../pr-constants/pr-constants.service';
import { remove } from 'lodash';

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

const DATA_FIELDS: ProfileItemsDataCol[] = [
  'string1',
  'string2',
  'string3',
  'day1',
  'day2',
  'textData1',
  'locnId1'
];

export type ProfileItemsDataCol = ProfileItemsStringDataCol | ProfileItemsIntDataCol;

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
    this.profileItemDictionary = {};

    for (const item of profileItems) {
      this.addProfileItemToDictionary(item);
    }

    // create stubs for the rest of the profile items so at least one exists for given profile item type
    this.stubEmptyProfileItems();
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

  createEmptyProfileItem(fieldNameShort: FieldNameUIShort) {
    const currentArchive = this.account.getArchive();
    const shortType = currentArchive.type.split('.').pop();
    const template = this.constants.getProfileTemplate();
    const templateForType = template[shortType];
    const valueTemplate = templateForType[fieldNameShort];

    const item: ProfileItemVOData = {
      archiveId: currentArchive.archiveId,
      fieldNameUI: valueTemplate.field_name_ui
    };


    // completely useless type field but have to still set it for now
    switch (fieldNameShort) {
      case 'birth_info':
      case 'death_info':
        item.type = 'type.widget.date';
        break;
      case 'job':
      case 'home':
        item.type = 'type.widget.locn';
        break;
      case 'description':
        item.type = 'type.widget.description';
        break;
      default:
        item.type = 'type.widget.string';
    }

    return item;
  }

  stubEmptyProfileItems() {
    const currentArchive = this.account.getArchive();
    const shortType = currentArchive.type.split('.').pop();
    const template = this.constants.getProfileTemplate();
    const templateForType = template[shortType];

    const fields = Object.keys(templateForType) as FieldNameUIShort[];
    for (const fieldNameShort of fields) {
      if (!this.profileItemDictionary[fieldNameShort]) {
        this.profileItemDictionary[fieldNameShort] = [ this.createEmptyProfileItem(fieldNameShort) ];
      }
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
    if (!item.profile_itemId) {
      item.profile_itemId = updated.profile_itemId;
    }
  }

  async deleteProfileItem(item: ProfileItemVOData) {
    if (item.profile_itemId) {
      const response = await this.api.archive.deleteProfileItem(item);
    }
    const fieldNameShort = item.fieldNameUI.split('.')[1] as FieldNameUIShort;
    const list = this.profileItemDictionary[fieldNameShort];

    if (list.length === 1) {
      list[0] = this.createEmptyProfileItem(fieldNameShort);
    } else {
      remove(this.profileItemDictionary[fieldNameShort], item);
    }
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

  isItemEmpty(item: ProfileItemVOData) {
    const fieldsToCheck = DATA_FIELDS;

    for (const field of fieldsToCheck) {
      if (item[field]) {
        return false;
      }
    }

    return true;
  }

  getProfileProgress() {

  }


}
