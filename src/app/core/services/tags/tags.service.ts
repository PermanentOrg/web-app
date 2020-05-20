import { Injectable } from '@angular/core';
import { TagVOData } from '@models/tag-vo';
import debug from 'debug';
import { ItemVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { orderBy } from 'lodash';
import { Subject } from 'rxjs';
import { debugSubscribable } from '@shared/utilities/debug';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private tags: Map<number, TagVOData> = new Map();
  private tagsSubject: Subject<TagVOData[]> = new Subject();
  private debug = debug('service:tagsService');
  constructor(
    private account: AccountService
  ) {
    this.refreshTags();

    this.account.archiveChange.subscribe(() => {
      this.resetTags();
    });

    debugSubscribable('getTags', this.debug, this.getTags$());
  }

  resetTags() {
    this.debug('reset tags');
    this.tags.clear();
    this.refreshTags();
  }

  refreshTags() {

  }

  checkTagsOnItem(item: ItemVO) {
    if (!item.TagVOs?.length) {
      return;
    }

    let hasNew = false;

    for (const itemTag of item.TagVOs) {
      if (!this.tags.has(itemTag.tagId)) {
        this.tags.set(itemTag.tagId, itemTag);
        hasNew = true;
        this.debug('new tag seen %o', itemTag);
      }
    }

    if (hasNew) {
      this.tagsSubject.next(this.getTags());
    }
  }

  getTags() {
    return orderBy(Array.from(this.tags.values()), 'name');
  }

  getTags$() {
    return this.tagsSubject.asObservable();
  }
}
