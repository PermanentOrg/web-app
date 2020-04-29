import { Injectable } from '@angular/core';
import { FolderPickerComponent, FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderVO } from '@root/app/models';

@Injectable()
export class FolderPickerService {
  private component: FolderPickerComponent;

  constructor() { }

  registerComponent(toRegister: FolderPickerComponent) {
    if (this.component) {
      throw new Error('FolderPickerService - Folder picker component already registered');
    }

    this.component = toRegister;
  }

  deregisterComponent() {
    this.component = null;
  }

  chooseFolder(
    startingFolder: FolderVO,
    operation: FolderPickerOperations,
    savePromise?: Promise<any>,
    filterFolderLinkIds: number[] = null
  ) {
    if (!this.component) {
      throw new Error('FolderPickerService - Folder picker component missing');
    }

    return this.component.show(startingFolder, operation, savePromise, filterFolderLinkIds);
  }
}
