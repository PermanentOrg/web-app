import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostBinding, Inject } from '@angular/core';
import { SearchService } from '@search/services/search.service';
import { ItemVO, RecordVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ngIfScaleHeightEnterAnimation } from '@shared/animations';
import { FormBuilder, FormControl } from '@angular/forms';
import { pipe, of } from 'rxjs';
import { tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { SearchResponse } from '@shared/services/api/index.repo';
import { DOCUMENT } from '@angular/common';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
const LOCAL_RESULTS_LIMIT = 5;

type ResultsListType = 'local' | 'global';

@Component({
  selector: 'pr-global-search-bar',
  templateUrl: './global-search-bar.component.html',
  styleUrls: ['./global-search-bar.component.scss'],
  animations: [ngIfScaleHeightEnterAnimation]
})
export class GlobalSearchBarComponent implements OnInit {
  public searchTerm: string;

  public localResults: ItemVO[];
  public globalResults: ItemVO[];

  public localResultsByArchiveNbr: Set<string> = new Set();
  public localResultsByRecordId: Set<string> = new Set();
  public localResultsByFolderId: Set<string> = new Set();

  public waiting = false;
  public serverError = false;

  @ViewChild('searchInput') inputElementRef: ElementRef;
  public formControl: FormControl;

  @HostBinding('class.showing-results') public showResults = false;
  public isFocused = false;

  public activeResultIndex = -1;

  constructor(
    private searchService: SearchService,
    private data: DataService,
    private fb: FormBuilder,
    private account: AccountService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.formControl = this.fb.control('');
    this.initFormHandler();
  }

  ngOnInit(): void {
  }

  initFormHandler() {
    this.formControl.valueChanges.pipe(
      tap(term => {
        if (term) {
          this.showResults = true;
          this.updateLocalResults(term as string);
        }
      }),
      debounceTime(100),
      switchMap(term => {
        if (term) {
          if (term.length > 0) {
            this.waiting = true;
            return this.searchService.getResultsInCurrentArchive(term, 10)
              .pipe(catchError(err => {
                return of(err);
              }));
          }
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      this.waiting = false;
      if (response) {
        if (response instanceof SearchResponse && response.isSuccessful) {
          this.globalResults = response.getItemVOs().filter(i => {
            if (i instanceof RecordVO) {
              return !this.localResultsByRecordId.has(i.recordId);
            } else {
              return !this.localResultsByFolderId.has(i.folderId) && this.data.currentFolder.folderId !== i.folderId;
            }
          });
        } else {
          this.globalResults = [];
        }
      } else {
        this.reset();
      }
    }, err => {

    });
  }

  resultTrackByFn(item: ItemVO) {
    return item.folder_linkId;
  }

  setBodyClass() {
    if (this.isFocused) {
      this.document.documentElement.classList.add('global-search-active');
    } else {
      this.document.documentElement.classList.remove('global-search-active');
    }
  }

  onInputChange(term: string) {
    if (term) {
      this.showResults = true;
      this.updateLocalResults(term);
    } else {
      this.reset();
    }
  }

  onInputFocus() {
    this.isFocused = true;
    this.setBodyClass();
  }

  onInputBlur() {
    this.isFocused = false;
    setTimeout(() => {
      this.reset();
      this.setBodyClass();
  }, 100);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (!this.localResults && !this.globalResults) {
      return;
    }

    const isArrow = event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW;
    const isEnter = event.keyCode === ENTER;

    const localLength = this.localResults?.length || 0;
    const globalLength = this.globalResults?.length || 0;
    const totalLength = localLength + globalLength;

    if (!(isArrow  || isEnter) || !totalLength) {
      return;
    }

    if (isArrow) {
      const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
      const newActiveResultIndex = this.activeResultIndex + direction;
      this.activeResultIndex = Math.min(Math.max(-1, newActiveResultIndex), totalLength - 1);
    } else if (event.keyCode === ENTER) {
      this.onInputEnter();
    }
  }

  onInputEnter() {
    const localLength = this.localResults?.length || 0;
    const globalLength = this.globalResults?.length || 0;
    const totalLength = localLength + globalLength;

    if (-1 < this.activeResultIndex && this.activeResultIndex < localLength) {
      this.onLocalResultClick(this.localResults[this.activeResultIndex]);
    } else if (localLength <= this.activeResultIndex && this.activeResultIndex < totalLength ) {
      this.onGlobalResultClick(this.globalResults[this.activeResultIndex - localLength]);
    }
    this.reset();
    setTimeout(() => {
      (this.inputElementRef.nativeElement as HTMLInputElement).blur();
    }, 100);
  }

  isSelectedResult(list: ResultsListType, listIndex: number) {
    let offset = 0;

    switch (list) {
      case 'global':
        offset = this.localResults.length;
    }

    return (this.activeResultIndex - offset) === listIndex;
  }


  reset() {
    this.showResults = false;
    this.localResults = null;
    this.localResultsByFolderId.clear();
    this.localResultsByRecordId.clear();
    this.globalResults = null;
    this.activeResultIndex = -1;
    this.formControl.setValue('', { emitEvent: false });
  }

  updateLocalResults(term: string) {
    this.localResultsByFolderId.clear();
    this.localResultsByRecordId.clear();
    this.localResults = this.searchService.getResultsInCurrentFolder(term, LOCAL_RESULTS_LIMIT);
    for (const result of this.localResults) {
      if (result instanceof RecordVO) {
        this.localResultsByRecordId.add(result.recordId);
      } else {
        this.localResultsByFolderId.add(result.folderId);
      }
    }
    this.showResults = true;
  }

  onLocalResultClick(item: ItemVO) {
    this.data.showItem(item, true);
  }

  onGlobalResultClick(item: ItemVO) {
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
