import { DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ArchiveVO, RelationVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { SearchResponse } from '@shared/services/api/index.repo';
import { of } from 'rxjs';
import { ArchiveSearchBoxComponent } from './archive-search-box.component';

describe('ArchiveSearchBoxComponent', () => {
  let relationshipService: RelationshipService;
  let apiService: ApiService;

  let component: ArchiveSearchBoxComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        RelationshipService,
        AccountService,
        ApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    relationshipService =
      TestBed.inject<RelationshipService>(RelationshipService);
    apiService = TestBed.inject<ApiService>(ApiService);

    component = new ArchiveSearchBoxComponent(
      relationshipService,
      null,
      apiService,
    );
    component.ngOnInit();
  });

  it('should exist', () => {
    expect(component).toBeDefined();
  });

  it('should set up Observable for input valueChanges', () => {
    expect(component.searchResults$).toBeDefined();
  });

  it('should search RelationshipService when a non-email value is entered', fakeAsync(() => {
    const searchSpy = spyOn(
      relationshipService,
      'searchRelationsByName',
    ).and.returnValue([]);

    const sub = component.searchResults$.subscribe((results) => {
      expect(results).toEqual([]);
    });

    component.control.setValue('test');

    tick(500);

    expect(searchSpy).toHaveBeenCalledWith('test');

    expect(component.resultsCount).toBe(0);

    sub.unsubscribe();
  }));

  it('should return all RelationshipService results when focused with empty term', fakeAsync(() => {
    const archive1 = new ArchiveVO({});
    archive1.fullName = 'My Friend';

    const archive2 = new ArchiveVO({});
    archive2.fullName = 'My Other Friend';

    const relation1 = new RelationVO({});
    relation1.RelationArchiveVO = archive1;

    const relation2 = new RelationVO({});
    relation2.RelationArchiveVO = archive2;

    const getAllSpy = spyOn(relationshipService, 'getSync').and.returnValue([
      relation1,
      relation2,
    ]);

    const sub = component.searchResults$.subscribe((results) => {
      expect(getAllSpy).toHaveBeenCalled();
      expect(results).toBeDefined();
      expect(results).toEqual([archive1, archive2]);
      sub.unsubscribe();
    });

    component.onFocus();

    tick(500);
  }));

  it('should return results from email search when email is valid', fakeAsync(() => {
    const archive1 = new ArchiveVO({});
    archive1.fullName = 'My Friend';
    archive1.archiveId = 1;

    const searchResponse = new SearchResponse({});
    searchResponse.isSuccessful = true;
    searchResponse.Results = [
      {
        data: [
          {
            ArchiveVO: archive1,
          },
        ],
      },
    ];

    const emailSearchSpy = spyOn(
      apiService.search,
      'archiveByEmail',
    ).and.returnValue(of(searchResponse));

    const sub = component.searchResults$.subscribe((results) => {
      expect(emailSearchSpy).toHaveBeenCalled();
      expect(results).toBeDefined();
      expect(results).toEqual([archive1]);
      sub.unsubscribe();
    });

    component.focused = true;

    component.control.setValue('test@test.com');

    tick(500);
  }));

  it('should filter RelationshipService results when filter provided', fakeAsync(() => {
    const archive1 = new ArchiveVO({});
    archive1.fullName = 'My Friend';
    archive1.archiveId = 1;

    const archive2 = new ArchiveVO({});
    archive2.fullName = 'My Other Friend';
    archive2.archiveId = 2;

    const relation1 = new RelationVO({});
    relation1.RelationArchiveVO = archive1;

    const relation2 = new RelationVO({});
    relation2.RelationArchiveVO = archive2;

    const getAllSpy = spyOn(relationshipService, 'getSync').and.returnValue([
      relation1,
      relation2,
    ]);

    component.filterFn = (archive: ArchiveVO) => archive.archiveId !== 1;

    const sub = component.searchResults$.subscribe((results) => {
      expect(getAllSpy).toHaveBeenCalled();
      expect(results.length).toBe(1);
      expect(results).toEqual([archive2]);
      sub.unsubscribe();
    });

    component.onFocus();
    tick(500);
  }));

  it('should set the active result index appropriately based on arrow keys', fakeAsync(() => {
    const archive1 = new ArchiveVO({});
    archive1.fullName = 'My Friend';
    archive1.archiveId = 1;

    const archive2 = new ArchiveVO({});
    archive2.fullName = 'My Other Friend';
    archive2.archiveId = 2;

    const relation1 = new RelationVO({});
    relation1.RelationArchiveVO = archive1;

    const relation2 = new RelationVO({});
    relation2.RelationArchiveVO = archive2;

    const getAllSpy = spyOn(relationshipService, 'getSync').and.returnValue([
      relation1,
      relation2,
    ]);

    const sub = component.searchResults$.subscribe((results) => {});

    component.onFocus();
    tick(500);

    expect(component.resultsCount).toBe(2);
    expect(component.activeResultIndex).toBe(-1);

    const arrowDownEvent = { keyCode: DOWN_ARROW };
    const arrowUpEvent = { keyCode: UP_ARROW };

    component.onInputKeydown(arrowDownEvent as KeyboardEvent);
    component.onInputKeydown(arrowUpEvent as KeyboardEvent);
    component.onInputKeydown(arrowDownEvent as KeyboardEvent);
    component.onInputKeydown(arrowDownEvent as KeyboardEvent);

    expect(component.activeResultIndex).toBe(1);

    component.onInputKeydown(arrowUpEvent as KeyboardEvent);

    expect(component.activeResultIndex).toBe(0);

    component.onInputKeydown(arrowDownEvent as KeyboardEvent);
    component.onInputKeydown(arrowDownEvent as KeyboardEvent);

    expect(component.activeResultIndex).toBe(component.results.length - 1);
  }));

  it('should set focused to true after a delay when onBlur is called', fakeAsync(() => {
    component.focused = false;

    component.onBlur();

    expect(component.focused).toBe(false);

    tick(150);

    expect(component.focused).toBe(true);
  }));
});
