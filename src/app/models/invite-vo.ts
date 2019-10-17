import { BaseVO } from '@models/base-vo';
import { ArchiveVO, AccountVO, RecordVO, FolderVO, ShareVO } from '.';

export class InviteVO extends BaseVO {
  public email: string;
  public fullName: string;
  public relationship: string;
  public byArchiveId: number;
  public accessRole: string;
  public type: string;

  public ArchiveVO;
  public AccountVO;
  public RecordVO;
  public FolderVO;
  public InviteShareVO;
  public ShareVO;

  constructor(voData: InviteVOData) {
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

    if (this.ShareVO) {
      this.ShareVO = new ShareVO(this.ShareVO);
    }
  }
}

export interface InviteVOData {
  email?: string;
  fullName?: string;
  relationship?: string;
  type?: string;
  byArchiveId?: number;
  accessRole?: string;
}
