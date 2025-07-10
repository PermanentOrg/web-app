/* @format */
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { SearchService } from '@search/services/search.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { ArchiveVO, TagVO } from '@models/index';
import { Router } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ArchiveSearchComponent } from './archive-search.component';

describe('ArchiveSearchComponent', () => {
  let component: ArchiveSearchComponent;
  let fixture: ComponentFixture<ArchiveSearchComponent>;
  let searchService: jasmine.SpyObj<SearchService>;
  let publicProfileService: jasmine.SpyObj<PublicProfileService>;
  let router: Router;

  beforeEach(async () => {
    publicProfileService = jasmine.createSpyObj('PublicProfileService', [
      'archive$',
    ]);
    searchService = jasmine.createSpyObj('SearchService', [
      'getPublicArchiveTags',
      'getResultsInPublicArchive',
    ]);

    await TestBed.configureTestingModule({
    declarations: [ArchiveSearchComponent],
    imports: [ReactiveFormsModule],
    providers: [
        FormBuilder,
        { provide: SearchService, useValue: searchService },
        { provide: PublicProfileService, useValue: publicProfileService },
        {
            provide: Router,
            useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    publicProfileService.archive$.and.returnValue(
      of(new ArchiveVO({ archiveId: '123' })),
    );
    searchService.getPublicArchiveTags.and.returnValue(of([]));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSearchComponent);
    component = fixture.componentInstance;

    component.searchForm = new FormBuilder().group({
      query: ['', [Validators.required]],
    });

    fixture.detectChanges();

    publicProfileService.archive$.and.returnValue(
      of(new ArchiveVO({ archiveId: '123' })),
    );
    searchService.getPublicArchiveTags.and.returnValue(
      of([{ name: 'Tag1', tagId: 1 }]),
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize searchForm with query control', () => {
    expect(component.searchForm.contains('query')).toBe(true);
  });

  it('should fetch tags on initialization', () => {
    searchService.getPublicArchiveTags.and.returnValue(
      of([{ name: 'Tag1', tagId: 1 }]),
    );

    component.ngOnInit();
    fixture.detectChanges();

    expect(searchService.getPublicArchiveTags).toHaveBeenCalledWith('123');
    expect(component.tags).toEqual([{ name: 'Tag1', tagId: 1 }]);
  });

  it('should emit search event on handleSearch', () => {
    spyOn(component.search, 'emit');
    component.searchForm.patchValue({ query: 'test query' });

    component.onHandleSearch();

    expect(component.search.emit).toHaveBeenCalledWith('test query');
  });

  it('should clear the form when clearForm is called', () => {
    component.searchForm.patchValue({ query: 'test' });

    component.clearForm();

    expect(component.searchForm.value.query).toBe(null);
  });

  it('should update the search results when tag is clicked', () => {
    const mockTag: TagVO = new TagVO({ name: 'Tag1', tagId: 1 });
    component.onTagClick([mockTag]);

    expect(component.searchForm.value.query).toBe('tag:"Tag1"');
    expect(component.tag).toEqual([mockTag]);
  });

  it('should reset search results when term is cleared', () => {
    component.searchForm.patchValue({ query: '' });
    fixture.detectChanges();

    expect(component.searchResults).toEqual([]);
    expect(component.filteredTags).toEqual([]);
  });

  it('should emit searchByTag event on tagClick', () => {
    spyOn(component.searchByTag, 'emit');
    component.searchForm.patchValue({ query: 'test query' });

    component.onTagClick([new TagVO({ name: 'Tag1', tagId: 1 })]);

    expect(component.searchByTag.emit).toHaveBeenCalledWith({
      tagId: 1,
      tagName: 'Tag1',
    });
  });
});
