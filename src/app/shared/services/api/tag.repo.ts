import { ArchiveVO, TagVO, TagVOData, TagLinkVOData } from '@root/app/models';
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

  public deleteTagLink(tag: TagVOData, tagLink: TagLinkVOData) {
    const data = [{
      TagVO: tag,
      TagLinkVO: tagLink
    }];

    return this.http.sendRequestPromise<TagResponse>('/tag/deleteTagLink', data, TagResponse);
  }

  public getTagsByArchive(archive: ArchiveVO): Promise<TagResponse> {
    const data = [{
      ArchiveVO: {
        archiveId: archive.archiveId
      }
    }];

    return this.http.sendRequestPromise<TagResponse>('/tag/getTagsByArchive', data, TagResponse);
  }

  public delete(tag: TagVO | TagVO[]): Promise<TagResponse> {
    let data: Array<{TagVO: TagVO}> = [];
    if (Array.isArray(tag)) {
      data = tag.map((t) => ({
          TagVO: new TagVO(t),
        }
      ));
    } else {
      data.push({
        TagVO: new TagVO(tag),
      });
    }

    return this.http.sendRequestPromise<TagResponse>('/tag/delete', data, TagResponse);
  }

  public update(tag: TagVO | TagVO[]): Promise<TagResponse> {
    let data: Array<{TagVO: TagVO}> = [];
    if (Array.isArray(tag)) {
      data = tag.map((t) => ({
          TagVO: new TagVO(t),
        }
      ));
    } else {
      data.push({
        TagVO: new TagVO(tag),
      });
    }

    return this.http.sendRequestPromise<TagResponse>('/tag/updateTag', data, TagResponse);
  }
}

export class TagResponse extends BaseResponse {
  public getTagVOData(): TagVOData {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return data[0][0].TagVO as TagVOData;
  }

  public getTagVOsData(): TagVOData[] {
    const data = this.getResultsData();

    if (!data[0]) {
      return [];
    }

    return data[0].map((result) => {
      return result.TagVO as TagVOData;
    });
  }

  public getTagVOs(): TagVO[] {
    return this.getTagVOsData().map((tag) => {
      return new TagVO(tag);
    });
  }
}
