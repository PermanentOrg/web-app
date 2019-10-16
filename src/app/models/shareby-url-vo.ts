import { BaseVO } from '@models/base-vo';
import { RecordVO } from './record-vo';
import { ArchiveVO } from './archive-vo';
import { AccountVO } from './account-vo';
import { FolderVO } from './folder-vo';

export class ShareByUrlVO extends BaseVO {
  public shareby_urlId: number;
  public folder_linkId: number;
  public status: string;
  public urlToken: string;
  public shareUrl: string;
  public uses: number;
  public maxUses: number;
  public previewToggle;
  public requestToken: string;
  public expiresDT;
  public byAccountId: number;
  public byArchiveId: number;

  public ArchiveVO;
  public AccountVO;
  public RecordVO;
  public FolderVO;
  public ShareVO;

  constructor(voData: any) {
    super(voData);

    if (this.ArchiveVO) {
      this.ArchiveVO = new ArchiveVO(this.ArchiveVO);
    }

    if (this.AccountVO) {
      this.AccountVO = new AccountVO(this.AccountVO);
    }

    if (this.RecordVO) {
      this.RecordVO = new RecordVO(this.RecordVO);
    }

    if (this.FolderVO) {
      this.FolderVO = new FolderVO(this.FolderVO);
    }
  }
}
