import { FolderVO, RecordVO } from '@models';
import { FilesystemApi } from './types/filesystem-api';
import { ArchiveIdentifier } from './types/archive-identifier';
import {
  FolderIdentifier,
  RecordIdentifier,
} from './types/filesystem-identifier';

export class PermanentFilesystem {
  constructor(private api: FilesystemApi) {}

  public async getArchiveRoot(archive: ArchiveIdentifier): Promise<FolderVO> {
    return await this.api.getRoot(archive);
  }

  public async getFolder(folder: FolderIdentifier): Promise<FolderVO> {
    return await this.api.navigate(folder);
  }

  public async getRecord(record: RecordIdentifier): Promise<RecordVO> {
    return await this.api.getRecord(record);
  }
}
