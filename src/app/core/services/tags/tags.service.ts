import { Injectable } from '@angular/core';
import { TagVOData } from '@models/tag-vo';
import debug from 'debug';
import { ItemVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { orderBy, find } from 'lodash';
import { Subject } from 'rxjs';
import { debugSubscribable } from '@shared/utilities/debug';
import { ApiService } from '@shared/services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private tags: Map<number, TagVOData> = new Map();
  private tagsSubject: Subject<TagVOData[]> = new Subject();
  private debug = debug('service:tagsService');
  constructor(
    private account: AccountService,
    private api: ApiService
  ) {
    this.refreshTags();

    this.account.archiveChange.subscribe(() => {
      this.resetTags();
      this.refreshTags();
    });

    debugSubscribable('getTags', this.debug, this.getTags$());
  }

  resetTags() {
    this.debug('reset tags');
    this.tags.clear();
    this.refreshTags();
  }

  async refreshTags() {
    if (this.account.getArchive()) {
      const response = await this.api.tag.getTagsByArchive(this.account.getArchive());
      const tags = response.getTagVOs().filter(t => t.name);
      for (const tag of tags) {
        this.tags.set(tag.tagId, tag);
      }
      this.tagsSubject.next(this.getTags());
      this.debug('got %d tags for archive', this.tags.size);
    } else {
      this.tags.clear();
    }
  }

  checkTagsOnItem(item: ItemVO) {
    if (!item.TagVOs?.length) {
      return;
    }

    let hasNew = false;

    for (const itemTag of item.TagVOs) {
      if (!this.tags.has(itemTag.tagId) && itemTag.name) {
        this.tags.set(itemTag.tagId, itemTag);
        hasNew = true;
        this.debug('new tag seen %o', itemTag);
      }
    }

    if (hasNew) {
      this.tagsSubject.next(this.getTags());
    }
  }

  getTagByName(name: string) {
    const tags = this.getTags();
    return find(tags, { name });
  }

  getTags() {
    return orderBy(Array.from(this.tags.values()), 'name');
  }

  getTags$() {
    return this.tagsSubject.asObservable();
  }
}
