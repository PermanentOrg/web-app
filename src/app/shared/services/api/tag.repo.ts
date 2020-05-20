import { ArchiveVO, TagVOData } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';

export class TagRepo extends BaseRepo {
  public getTagsByArchive(archive: ArchiveVO): Promise<TagResponse> {
    const data = [{
      ArchiveVO: {
        archiveId: archive.archiveId
      }
    }];

    return this.http.sendRequestPromise<TagResponse>('/tag/getTagsByArchive', data, TagResponse);
  }
}

export class TagResponse extends BaseResponse {
  public getTagVO(): TagVOData {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return data[0][0].TagVO as TagVOData;
  }

  public getTagVOs(): TagVOData[] {
    const data = this.getResultsData();

    return data[0].map((result) => {
      return result.TagVO as TagVOData;
    });
  }
}
