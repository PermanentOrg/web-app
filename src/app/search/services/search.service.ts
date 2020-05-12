import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { ItemVO } from '@models';
import Fuse from 'fuse.js';
import { Observable } from 'rxjs';
import { SearchResponse } from '@shared/services/api/index.repo';

@Injectable()
export class SearchService {
  private fuseOptions: Fuse.IFuseOptions<ItemVO> = {
    keys: ['displayName'],
    threshold: 0.1
  };
  private fuse = new Fuse([], this.fuseOptions);
  constructor(
    private api: ApiService,
    private data: DataService
  ) {
    this.data.currentFolderChange.subscribe(() => {
      this.indexCurrentFolder();
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

  indexCurrentFolder() {
    if (this.data.currentFolder?.ChildItemVOs) {
      this.fuse.setCollection(this.data.currentFolder.ChildItemVOs);
    } else {
      this.fuse.setCollection([]);
    }
  }
}
