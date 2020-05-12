import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { ItemVO } from '@models';
import Fuse from 'fuse.js';

@Injectable()
export class SearchService {
  private fuseOptions: Fuse.IFuseOptions<ItemVO> = {
    keys: ['displayName']
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

  getResultsInCurrentFolder(searchTerm: string): ItemVO[] {
    const results = this.fuse.search(searchTerm);

    console.log(results);
    return results.map(i => {
      return i.item;
    });
  }

  indexCurrentFolder() {
    if (this.data.currentFolder) {
      this.fuse.setCollection(this.data.currentFolder.ChildItemVOs);
    } else {
      this.fuse.setCollection([]);
    }
  }
}
