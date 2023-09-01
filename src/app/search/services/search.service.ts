/* @format */
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
    threshold: 0.1,
    ignoreLocation: true,
  };
  private fuse = new Fuse([], this.fuseOptions);

  private tagsFuseOptions: Fuse.IFuseOptions<TagVOData> = {
    keys: ['name'],
    threshold: 0.1,
    ignoreLocation: true,
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

    this.tags.getTags$().subscribe((newTags) => {
      this.indexTags(newTags);
    });
  }

  getResultsInCurrentFolder(searchTerm: string, limit?: number): ItemVO[] {
    if (!searchTerm) {
      return [];
    }

    let results = this.fuse.search(searchTerm);

    if (limit) {
      results = results.slice(0, limit);
    }

    return results.map((i) => {
      return i.item;
    });
  }

  parseSearchTerm(termString: string): [string, TagVOData[]] {
    const splitByTerm = new RegExp(/\s(?=(?:[^"]+(["])[^"]+\1)*[^"]*$)/g);
    const getTagName = new RegExp(/"(.+)"/g);
    let queryString: string;
    const parsedTags: TagVOData[] = [];

    if (termString.match(/tag:"(.*)"/)) {
      const queryParts = [];
      const parts = termString.split(splitByTerm).filter((x) => x && x !== '"');
      for (const part of parts) {
        if (part.includes('tag:')) {
          const tagNames = part.match(getTagName) || [];
          for (const tagName of tagNames) {
            if (tagName) {
              const name = tagName.replace(/"/g, '');
              const tag = this.tags.getTagByName(name);
              if (tag) {
                parsedTags.push(tag);
              }
            }
          }
        } else {
          queryParts.push(part);
        }
      }
      if (queryParts.length) {
        queryString = queryParts.join(' ');
      }
    } else {
      queryString = termString;
    }

    return [queryString, parsedTags];
  }

  getResultsInCurrentArchive(
    searchTerm: string,
    tags: TagVOData[],
    limit?: number
  ): Observable<SearchResponse> {
    return this.api.search.itemsByNameObservable(searchTerm, tags, limit);
  }

  getResultsInPublicArchive(
    searchTerm: string,
    tags: TagVOData[],
    archiveId: string,
    limit?: number
  ) {
    return this.api.search.itemsByNameInPublicArchiveObservable(
      searchTerm,
      tags,
      archiveId,
      limit
    );
  }

  getTagResults(searchTerm: string, limit?: number) {
    if (!searchTerm) {
      return [];
    }

    let results = this.tagsFuse.search(searchTerm);

    if (limit) {
      results = results.slice(0, limit);
    }

    return results.map((i) => {
      return i.item as TagVOData;
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
