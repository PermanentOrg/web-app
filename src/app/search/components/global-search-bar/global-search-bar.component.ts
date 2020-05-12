import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostBinding } from '@angular/core';
import { SearchService } from '@search/services/search.service';
import { ItemVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ngIfScaleHeightEnterAnimation } from '@shared/animations';
import { FormBuilder, FormControl } from '@angular/forms';
import { pipe, of } from 'rxjs';
import { tap, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { SearchResponse } from '@shared/services/api/index.repo';
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
            return this.searchService.getResultsInCurrentArchive(term)
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
          this.globalResults = response.getRecordVOs();
        } else {
          this.globalResults = [];
        }
      } else {
        this.reset();
      }
    }, err => {

    });
  }

  onGlobalResults(response: SearchResponse) {

  }

  onInputChange(term: string) {
    if (term) {
      this.showResults = true;
      this.updateLocalResults(term);
    } else {
      this.reset();
    }
  }

  onInputBlur() {
    this.isFocused = false;
    setTimeout(() => {
      this.reset();
    }, 100);
  }

  onInputKeydown(event: KeyboardEvent) {
    if (!this.localResults && !this.globalResults) {
      return;
    }

    const isArrow = event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW;
    const isEnter = event.keyCode === ENTER;

    const localLength = this.localResults?.length || 0;
    const globalLength = 0;
    const totalLength = localLength + globalLength;

    if (!(isArrow  || isEnter) || !totalLength) {
      return;
    }

    if (isArrow && this.localResults?.length) {
      const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
      const newActiveResultIndex = this.activeResultIndex + direction;
      this.activeResultIndex = Math.min(Math.max(-1, newActiveResultIndex), localLength + globalLength - 1);
    } else if (event.keyCode === ENTER) {
      this.onInputEnter();
    }
  }

  onInputEnter() {
    if (-1 < this.activeResultIndex && this.activeResultIndex < this.localResults?.length) {
      // local result
      this.onLocalResultClick(this.localResults[this.activeResultIndex]);
    } else if (this.activeResultIndex < this.globalResults?.length ) {
      // global result
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
    this.globalResults = null;
    this.activeResultIndex = -1;
  }

  updateLocalResults(term: string) {
    this.localResults = this.searchService.getResultsInCurrentFolder(term, LOCAL_RESULTS_LIMIT);
    this.showResults = true;
  }

  onLocalResultClick(item: ItemVO) {
    this.data.showItem(item, true);
  }

}
