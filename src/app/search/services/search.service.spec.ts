/* @format */
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { TagsService } from '@core/services/tags/tags.service';
import { TagVO, TagVOData } from '@models/tag-vo';
import { SearchService } from './search.service';
import { FolderVO, ItemVO, RecordVO } from '@models/index';

interface ItemVOData {
  displayName: string;
}

class MockApiService {}
class MockDataService {
  public currentFolderChange = new Subject<void>();
  public currentFolder: FolderVO = new FolderVO({});

  public setCurrentFolder(folder: FolderVO): void {
    this.currentFolder = folder;
    this.currentFolderChange.next();
  }
}
class MockTagsService {
  private tags: TagVOData[] = [];
  private tagsSubject = new Subject<TagVOData[]>();

  public getTags$(): Subject<TagVOData[]> {
    return this.tagsSubject;
  }

  public getTagByName(name: string): TagVOData {
    return this.tags.find((t) => t.name === name);
  }

  public setTags(tags: TagVOData[]): void {
    this.tags = tags;
    this.tagsSubject.next(this.tags);
  }
}

describe('SearchService', () => {
  let service: SearchService;
  let tags: MockTagsService;
  let data: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService],
    });
    TestBed.overrideProvider(ApiService, { useValue: new MockApiService() });
    TestBed.overrideProvider(DataService, { useValue: new MockDataService() });
    TestBed.overrideProvider(TagsService, { useValue: new MockTagsService() });
    service = TestBed.inject(SearchService);
    tags = TestBed.inject(TagsService) as any as MockTagsService;
    data = TestBed.inject(DataService) as any as MockDataService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('ParseSearchTerm', () => {
    it('should generate a data structure for an empty search', () => {
      expectSearchToBe(service.parseSearchTerm(''), '', []);
    });

    it('should generate data for a basic search', () => {
      expectSearchToBe(service.parseSearchTerm('Potato'), 'Potato', []);
    });

    it('should remove tag tokens from search', () => {
      expectSearchToBe(
        service.parseSearchTerm('tag:"NonExistentTag"'),
        undefined,
        []
      );
    });

    it('should load tag tokens into the tags array', () => {
      tags.setTags([{ name: 'Potato' }]);
      expectSearchToBe(service.parseSearchTerm('tag:"Potato"'), undefined, [
        { name: 'Potato' },
      ]);
    });

    it('should preserve the rest of the search', () => {
      tags.setTags([{ name: 'Potato' }]);
      expectSearchToBe(
        service.parseSearchTerm('Hello tag:"Potato" World'),
        'Hello World',
        [{ name: 'Potato' }]
      );
      expectSearchToBe(
        service.parseSearchTerm('tag:"Potato" Hello World tag:"Potato"'),
        'Hello World',
        [{ name: 'Potato' }, { name: 'Potato' }]
      );
    });

    it('handles tag edge cases', () => {
      tags.setTags([{ name: 'tag:Test' }]);
      expectSearchToBe(service.parseSearchTerm('tag:"tag:"Test""'), undefined, [
        { name: 'tag:Test' },
      ]);
    });

    function expectSearchToBe(
      search: [string, TagVOData[]],
      expectedSearch: string,
      expectedTags: TagVOData[]
    ) {
      expect(search[0]).toBe(expectedSearch);
      expect(search[1]).toEqual(expectedTags);
    }
  });

  describe('getResultsInCurrentFolder', () => {
    it('handles an empty search term', () => {
      expect(search('')).toEqual([]);
    });

    it('can search an empty folder', () => {
      expect(search('Potato')).toEqual([]);
    });

    it('can search a populated folder', () => {
      setCurrentFolderChildren([
        { displayName: 'Potato' },
        { displayName: 'Do not match' },
      ]);
      const searchResults = search('Potato');
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].displayName).toBe('Potato');
    });

    it('should ignore location in fuzzy searches', () => {
      setCurrentFolderChildren([
        {
          displayName:
            'VeryLongDisplayNameThatNeedsToUseFuzzySearchAndIgnoreLocationPortrait',
        },
      ]);
      expect(search('Portrait').length).toBe(1);
    });

    it('should limit results if limit is provided', () => {
      setCurrentFolderChildren([
        { displayName: 'Potato' },
        { displayName: 'Potato Two' },
      ]);
      expect(search('Potato', 1).length).toBe(1);
    });

    function search(term: string, limit?: number): ItemVO[] {
      return service.getResultsInCurrentFolder(term, limit);
    }

    function setCurrentFolderChildren(children: ItemVOData[]): void {
      data.setCurrentFolder(
        new FolderVO({
          ChildItemVOs: children.map((child) => new RecordVO(child)),
        })
      );
    }
  });
});
