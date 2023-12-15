/* @format */
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { TagsService } from '@core/services/tags/tags.service';
import { TagVOData } from '@models/tag-vo';
import { FolderVO, ItemVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { SearchService } from './search.service';

interface ItemVOData {
  displayName: string;
}

class MockApiService {
  public search = {
    itemsByNameObservable() {
      return new Observable<void>();
    },
    itemsByNameInPublicArchiveObservable() {
      return new Observable<void>();
    },
  };
}
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
  let api: MockApiService;

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
    api = TestBed.inject(ApiService) as any as MockApiService;
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

    it('handles quotation marks in tag names properly', () => {
      tags.setTags([
        { name: 'Potato', tagId: 0 },
        { name: '"Potato"', tagId: 1 },
      ]);
      const searchTokens = service.parseSearchTerm('tag:""Potato""');

      expect(searchTokens[1].length).toBe(1);
      expect(searchTokens[1][0].tagId).toBe(1);
    });

    it('handles tag edge cases', () => {
      tags.setTags([{ name: 'tag:Test' }]);
      expectSearchToBe(
        service.parseSearchTerm('tag:"tag:"Test""'),
        'tag:"tag:"Test""',
        []
      );
    });

    it('handles returns the tags correctly if they have quotation marks', () => {
      tags.setTags([{ name: 'tag:"Test"' }]);
      expectSearchToBe(service.parseSearchTerm('tag:"tag:"Test""'), undefined, [
        { name: 'tag:"Test"' },
      ]);
    });
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

  describe('getTagResults', () => {
    it('handles an empty search term', () => {
      expect(search('')).toEqual([]);
    });

    it('can search an empty tag registry', () => {
      expect(search('Potato')).toEqual([]);
    });

    it('can search a populated tag service', () => {
      tags.setTags([{ name: 'Potato' }, { name: 'DoNotMatch' }]);
      const searchResults = search('Potato');

      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toBe('Potato');
    });

    it('should ignore location in fuzzy searches', () => {
      tags.setTags([
        { name: 'VeryLongTagNameThatProbablyWontEvenHappenInProduction' },
      ]);

      expect(search('Production').length).toBe(1);
    });

    it('should limit results if limit is provided', () => {
      tags.setTags([{ name: 'Potato' }, { name: 'Potato Two' }]);

      expect(search('Potato', 1).length).toBe(1);
    });

    function search(term: string, limit?: number): TagVOData[] {
      return service.getTagResults(term, limit);
    }
  });

  it('can do a complete archive search', () => {
    const apiSpy = spyOn(api.search, 'itemsByNameObservable');
    service.getResultsInCurrentArchive('Test', []);

    expect(apiSpy).toHaveBeenCalled();
  });

  it('can do a public archive search', () => {
    const apiSpy = spyOn(api.search, 'itemsByNameInPublicArchiveObservable');
    service.getResultsInPublicArchive('Test', [], '1');

    expect(apiSpy).toHaveBeenCalled();
  });

  it('cannot handle tags with quotation marks followed by search terms with quotation marks', () => {
    tags.setTags([{ name: '"A Multiword Tag"', tagId: 0 }]);
    const searchTokens = service.parseSearchTerm(
      'tag:""A Multiword Tag"" "potato"'
    );

    expect(searchTokens[1].length).toBe(0);
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
