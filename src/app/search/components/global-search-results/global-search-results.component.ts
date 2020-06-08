import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, TagVOData, RecordVO, ItemVO } from '@models';
import { FormBuilder, FormControl } from '@angular/forms';
import { SearchService } from '@search/services/search.service';
import { map, tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchResponse } from '@shared/services/api/index.repo';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { remove } from 'lodash';
import { ngIfFadeInAnimation } from '@shared/animations';

@Component({
  selector: 'pr-global-search-results',
  templateUrl: './global-search-results.component.html',
  styleUrls: ['./global-search-results.component.scss'],
  animations: [ ngIfFadeInAnimation ]
})
export class GlobalSearchResultsComponent implements OnInit {
  @ViewChild('searchInput') inputElementRef: ElementRef;
  public formControl: FormControl;

  waiting = false;
  showResults = false;

  tagResults: TagVOData[];
  folderResults: FolderVO[];
  recordResults: RecordVO[];

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private searchService: SearchService,
    private router: Router,
    private account: AccountService,
    private route: ActivatedRoute
  ) {
    this.data.setCurrentFolder(new FolderVO({
      displayName: 'Search',
      pathAsText: ['Search'],
      type: 'page'
    }));

    this.formControl = this.fb.control('');

    this.initFormHandler();
  }

  ngOnInit(): void {
    const initQuery = this.getQueryFromParams();

    if (initQuery) {
      this.formControl.setValue(initQuery, {emitEvent: true});
    }
  }

  getQueryFromParams() {
    const queryParams = this.route.snapshot.queryParamMap;

    if (queryParams.has('query')) {
      return queryParams.get('query').trim();
    } else {
      return null;
    }
  }

  setQueryParams(query: string) {
    const params: any = {};

    if (query) {
      params.query = query.trim();
    }

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'merge'
      }
    );
  }

  initFormHandler() {
    this.formControl.valueChanges.pipe(
      map(term => {
        return this.searchService.parseSearchTerm(term);
      }),
      tap(([term, tags]) => {
        this.showResults = true;
        this.updateTagsResults(term as string, tags);
      }),
      debounceTime(50),
      switchMap(([term, tags]) => {
        if (term?.length || tags?.length) {
          this.waiting = true;
          return this.searchService.getResultsInCurrentArchive(term, tags, 10)
            .pipe(catchError(err => {
              return of(err);
            }));
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      this.waiting = false;
      if (response) {
        if (response instanceof SearchResponse && response.isSuccessful) {
          this.setQueryParams(this.formControl.value);
          const records: RecordVO[] = [];
          const folders: FolderVO[] = [];

          response.getItemVOs().map(i => {
            if (i instanceof RecordVO) {
              records.push(i);
            } else {
              folders.push(i);
            }
          });

          this.recordResults = records;
          this.folderResults = folders;
        } else {
          this.recordResults = [];
          this.folderResults = [];
        }
      } else {
        this.reset();
      }
    }, err => {
      console.error('Error from search results input:', err);
    });
  }

  resultTrackByFn(index, item: ItemVO) {
    return item.folder_linkId;
  }

  updateTagsResults(term: string, selectedTags: TagVOData[]) {
    const termMatches = this.searchService.getTagResults(term);
    const selectedNames = selectedTags.map(t => t.name);
    this.tagResults = termMatches.filter(i => !selectedNames.includes(i.name));
  }

  reset() {
    this.tagResults = null;
    this.folderResults = null;
    this.recordResults = null;
  }

  onTagResultClick(tag: TagVOData) {
    let searchTerm: string;
    let tags: TagVOData[];

    [ searchTerm, tags]  = this.searchService.parseSearchTerm(this.formControl.value);

    // replace any text query with existing tags + clicked tag
    tags.push(tag);
    const tagString = tags.map(t => `tag:"${t.name}"`).join(' ') + ' ';
    this.formControl.setValue(tagString);
    if (this.tagResults) {
      remove(this.tagResults, tag);
    }

    (this.inputElementRef.nativeElement as HTMLInputElement).focus();
  }

  onItemResultClick(item: ItemVO) {
    const publicRoot = this.account.getPublicRoot();
    const privateRoot = this.account.getPrivateRoot();

    let routerPath: any[];

    if (item.folder_linkType === 'type.folder_link.public') {
      if (item.parentArchiveNbr === publicRoot.archiveNbr) {
        routerPath = ['/m', 'public'];
      } else {
        routerPath = ['/m', 'public', item.parentArchiveNbr, item.parentFolder_linkId];
      }
    } else if (item.folder_linkType === 'type.folder_link.private') {
      if (item.parentArchiveNbr === privateRoot.archiveNbr) {
        routerPath = ['/m', 'myfiles'];
      } else {
        routerPath = ['/m', 'myfiles', item.parentArchiveNbr, item.parentFolder_linkId];
      }
    }

    if (routerPath) {
      this.router.navigate(routerPath, { queryParams: { showItem: item.folder_linkId }});
    }
  }

}
