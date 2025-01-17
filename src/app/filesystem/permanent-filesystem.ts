import { FolderVO, RecordVO } from '@models';
import { FilesystemApi } from './types/filesystem-api';
import { ArchiveIdentifier } from './types/archive-identifier';
import {
  FolderIdentifier,
  RecordIdentifier,
} from './types/filesystem-identifier';
import { FolderCache } from './folder-cache';

export class PermanentFilesystem {
  private folderCache: FolderCache;

  constructor(
    private api: FilesystemApi,
    private cache?: FolderCache,
  ) {
    if (cache) {
      this.folderCache = cache;
    } else {
      this.folderCache = new FolderCache();
    }
  }

  public async getArchiveRoot(archive: ArchiveIdentifier): Promise<FolderVO> {
    return await this.api.getRoot(archive);
  }

  public async getFolder(folder: FolderIdentifier): Promise<FolderVO> {
    const cachedFolder = this.folderCache.getFolder(folder);
    if (cachedFolder) {
      setTimeout(() => {
        this.fetchFolderFromApi(folder);
      }, 0);
      return cachedFolder;
    }
    return await this.fetchFolderFromApi(folder);
  }

  private async fetchFolderFromApi(folder: FolderIdentifier) {
    const fetchedFolder = await this.api.navigate(folder);
    this.folderCache.saveFolder(fetchedFolder);
    return fetchedFolder;
  }

  public async getRecord(record: RecordIdentifier): Promise<RecordVO> {
    return await this.api.getRecord(record);
  }
}
