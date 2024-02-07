import { FolderVO, RecordVO } from '@models';
import { FilesystemApi } from '../types/filesystem-api';
import {
  FolderIdentifier,
  RecordIdentifier,
} from '../types/filesystem-identifier';
import { ArchiveIdentifier } from '../types/archive-identifier';

export class FakeFilesystemApi implements FilesystemApi {
  private calledMethods: string[] = [];

  public async navigate(folder: FolderIdentifier) {
    this.logCall('navigate');
    return new FolderVO({});
  }

  public async getRoot(archive: ArchiveIdentifier) {
    this.logCall('getRoot');
    return new FolderVO({});
  }

  public async getRecord(record: RecordIdentifier) {
    this.logCall('recordGet');
    return new RecordVO({});
  }

  public methodWasCalled(name: string): boolean {
    return this.calledMethods.includes(name);
  }

  private logCall(name: string) {
    this.calledMethods.push(name);
  }
}
