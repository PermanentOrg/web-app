import { Injectable, EventEmitter } from '@angular/core';

import { FolderVO, RecordVO } from '@root/app/models';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { StorageService } from '../storage/storage.service';

const VIEW_STORAGE_KEY = 'folderView';

@Injectable()
export class FolderViewService {
  folderView: FolderView = FolderView.List;

  viewChange: EventEmitter<FolderView> = new EventEmitter<FolderView>();

  constructor(private storage: StorageService) {
    const storedView = Number(storage.session.get(VIEW_STORAGE_KEY));
    if (storedView) {
      this.folderView = storedView;
    }
  }

  setFolderView(folderView: FolderView) {
    this.folderView = folderView;
    this.storage.session.set(VIEW_STORAGE_KEY, folderView);

    this.viewChange.emit(this.folderView);
  }
}
