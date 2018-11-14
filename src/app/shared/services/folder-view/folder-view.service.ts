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
    const storedView = storage.session.get(VIEW_STORAGE_KEY);
    switch (storedView) {
      case 0:
        console.log(storedView);
        this.folderView = FolderView.List;
        break;
      case 1:
        console.log(storedView);
        this.folderView = FolderView.Grid;
        break;
    }

    console.log(storage.session.get(VIEW_STORAGE_KEY), storedView, this.folderView);
  }

  setFolderView(folderView: FolderView) {
    this.folderView = folderView;
    this.storage.session.set(VIEW_STORAGE_KEY, folderView);

    this.viewChange.emit(this.folderView);
  }
}
