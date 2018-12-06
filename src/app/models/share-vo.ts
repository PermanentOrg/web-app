import { orderBy } from 'lodash';

import { BaseVO } from '@models/base-vo';
import { ArchiveVO } from './archive-vo';
import { FolderVO } from './folder-vo';
import { RecordVO } from './record-vo';

export class ShareVO extends BaseVO {
  public shareId;
  public folder_linkId;
  public archiveId;
  public accessRole;
  public type;
  public status;

  public FolderVO: FolderVO;
  public RecordVO: RecordVO;
  public ItemVO;
  public FolderLinkVO;
  public ArchiveVO: ArchiveVO;

  constructor(voData: any) {
    super(voData);

    if (this.ArchiveVO) {
      this.ArchiveVO = new ArchiveVO(this.ArchiveVO);
    }

    if (this.FolderVO) {
      this.FolderVO = new FolderVO(this.FolderVO);
    }

    if (this.RecordVO) {
      this.RecordVO = new RecordVO(this.RecordVO);
    }
  }
}

