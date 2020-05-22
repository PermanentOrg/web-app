import { ArchiveVO, TagVOData, TagLinkVOData } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';

export class TagRepo extends BaseRepo {
  public create(tag: TagVOData, tagLink: TagLinkVOData) {
    const data = [{
      TagVO: {
        name: tag.name
      },
      TagLinkVO: tagLink
    }];

    return this.http.sendRequestPromise<TagResponse>('/tag/post', data, TagResponse);
  }

  public delete(tag: TagVOData, tagLink: TagLinkVOData) {
    const data = [{
      TagVO: tag,
      TagLinkVO: tagLink
    }];

    return this.http.sendRequestPromise<TagResponse>('/tag/delete', data, TagResponse);
  }

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

    if (!data[0]) {
      return [];
    }

    return data[0].map((result) => {
      return result.TagVO as TagVOData;
    });
  }
}
