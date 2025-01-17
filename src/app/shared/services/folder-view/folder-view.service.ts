import { Injectable, EventEmitter } from '@angular/core';

import { FolderVO, RecordVO } from '@root/app/models';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import debug from 'debug';
import { debugSubscribable } from '@shared/utilities/debug';
import { StorageService } from '../storage/storage.service';

const VIEW_STORAGE_KEY = 'folderView';

@Injectable()
export class FolderViewService {
  folderView: FolderView = FolderView.List;

  viewChange: EventEmitter<FolderView> = new EventEmitter<FolderView>();

  containerFlex = false;
  containerFlexChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  private debug = debug('folderViewService');
  constructor(private storage: StorageService) {
    const storedView = storage.session.get(VIEW_STORAGE_KEY);
    switch (storedView) {
      case FolderView.Grid:
      case FolderView.List:
      case FolderView.Timeline:
        this.folderView = storedView;
        break;
      default:
        this.folderView = FolderView.List;
    }

    this.debug('init view %o', this.folderView);

    this.containerFlexChange.subscribe((v) => {
      this.containerFlex = v;
    });

    debugSubscribable('viewChange', this.debug, this.viewChange);
  }

  setFolderView(folderView: FolderView, skipSave = false) {
    this.folderView = folderView;
    if (!skipSave) {
      this.storage.session.set(VIEW_STORAGE_KEY, folderView);
    }

    this.viewChange.emit(this.folderView);
  }
}
