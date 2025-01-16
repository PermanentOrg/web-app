import { isEqual, omit } from 'lodash';
import { FolderVO } from '@models/index';
import { FolderIdentifier } from './types/filesystem-identifier';
import { KeysOfUnion } from './types/keysofunion';

export class FolderCache {
  private folders: FolderVO[] = [];

  private fetchFromCache(
    query: FolderIdentifier,
    property: KeysOfUnion<FolderIdentifier>,
  ): FolderVO | undefined {
    if (property in query) {
      return this.folders.find((f) => f[property] === query[property]);
    }
  }

  public getFolder(folder: FolderIdentifier): FolderVO | null {
    return (
      this.fetchFromCache(folder, 'folderId') ||
      this.fetchFromCache(folder, 'folder_linkId') ||
      this.fetchFromCache(folder, 'archiveNbr') ||
      null
    );
  }

  public saveFolder(folder: FolderVO): void {
    const cachedFolder = this.getFolder(folder);
    if (cachedFolder) {
      if (!this.areFoldersEqual(cachedFolder, folder)) {
        cachedFolder.update(folder);
      }
    } else {
      this.folders.push(folder);
    }
  }

  private areFoldersEqual(a: FolderVO, b: FolderVO): boolean {
    return isEqual(omit(a, 'update'), omit(b, 'update'));
  }
}
