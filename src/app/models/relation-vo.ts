import { BaseVO } from '@models/base-vo';
import { ArchiveVO } from './archive-vo';

export class RelationVO extends BaseVO {
  public ArchiveVO: ArchiveVO;
  public RelationArchiveVO: ArchiveVO;
  public archiveId;
  public relationId;
  public relationArchiveId;
  public type;

  constructor(voData: any) {
    super(voData);

    if (voData.ArchiveVO) {
      this.ArchiveVO = new ArchiveVO(voData.ArchiveVO);
    }

    if (voData.RelationArchiveVO) {
      this.RelationArchiveVO = new ArchiveVO(voData.RelationArchiveVO);
    }
  }
}
