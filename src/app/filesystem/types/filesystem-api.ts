import { FolderVO, RecordVO } from '@models/index';
import { ArchiveIdentifier } from './archive-identifier';
import { FolderIdentifier, RecordIdentifier } from './filesystem-identifier';

export interface FilesystemApi {
	navigate: (folder: FolderIdentifier) => Promise<FolderVO>;
	getRoot: (archive: ArchiveIdentifier) => Promise<FolderVO>;
	getRecord: (record: RecordIdentifier) => Promise<RecordVO>;
}
