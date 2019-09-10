import { BaseVO } from '@models/base-vo';

export class ShareByUrlVO extends BaseVO {
  public shareby_urlId: number;
  public folder_linkId: number;
  public status: string;
  public urlToken: string;
  public shareUrl: string;
  public uses: number;
  public maxUses: number;
  public previewToggle;
  public expiresDT;
  public byAccountId: number;
  public byArchiveId: number;

  constructor(voData: any) {
    super(voData);
  }
}
