import { RelationVO, ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';

export class RelationRepo extends BaseRepo {
  public getAll(archiveVO: ArchiveVO) {
    const data = [{
      RelationVO: {
        archiveId: archiveVO.archiveId
      }
    }];

    return this.http.sendRequestPromise('/relation/getAll', data, RelationResponse);
  }
}

export class RelationResponse extends BaseResponse {
  public getRelationVO() {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0]) {
      return null;
    }

    return new RelationVO(data[0][0].RelationVO);
  }

  public getRelationVOs() {
    const data = this.getResultsData();
    const relations = data.map((result) => {
      return result.map((resultList) => {
        return new RelationVO(resultList.RelationVO);
      });
    });

    return flatten(relations);
  }
}
