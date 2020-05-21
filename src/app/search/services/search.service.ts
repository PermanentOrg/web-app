import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { ItemVO, TagLinkVOData, TagVOData } from '@models';
import Fuse from 'fuse.js';
import { Observable } from 'rxjs';
import { SearchResponse } from '@shared/services/api/index.repo';
import { TagsService } from '@core/services/tags/tags.service';

@Injectable()
export class SearchService {
  private fuseOptions: Fuse.IFuseOptions<ItemVO> = {
    keys: ['displayName'],
    threshold: 0.1
  };
  private fuse = new Fuse([], this.fuseOptions);

  private tagsFuseOptions: Fuse.IFuseOptions<ItemVO> = {
    keys: ['name'],
    threshold: 0.1
  };
  private tagsFuse = new Fuse([], this.tagsFuseOptions);

  constructor(
    private api: ApiService,
    private data: DataService,
    private tags: TagsService
  ) {
    this.data.currentFolderChange.subscribe(() => {
      this.indexCurrentFolder();
    });

    this.tags.getTags$().subscribe(newTags => {
      this.indexTags(newTags);
    });
  }

  getResultsInCurrentFolder(searchTerm: string, limit?: number): ItemVO[] {
    let results = this.fuse.search(searchTerm);

    if (limit) {
      results = results.slice(0, limit);
    }

    return results.map(i => {
      return i.item;
    });
  }

  getResultsInCurrentArchive(searchTerm: string, limit?: number): Observable<SearchResponse> {
    return this.api.search.itemsByNameObservable(searchTerm, limit);
  }

  getTagResults(searchTerm: string, limit?: number) {
    let results = this.tagsFuse.search(searchTerm);

    if (limit) {
      results = results.slice(0, limit);
    }

    return results.map(i => {
      return i.item;
    });
  }

  indexCurrentFolder() {
    if (this.data.currentFolder?.ChildItemVOs) {
      this.fuse.setCollection(this.data.currentFolder.ChildItemVOs);
    } else {
      this.fuse.setCollection([]);
    }
  }

  indexTags(tags: TagVOData[]) {
    if (!tags?.length) {
      this.tagsFuse.setCollection([]);
    } else {
      this.tagsFuse.setCollection(tags);
    }
  }
}
