import { Injectable } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { RecordVO, ArchiveVO } from '@models';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { MessageService } from '../message/message.service';

@Injectable({
providedIn: 'root'
})
export class ProfileService {

  constructor(
    private api: ApiService,
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
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError('There was a problem changing the archive profile picture.');
      }
    }
  }
}
