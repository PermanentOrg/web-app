import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostBinding } from '@angular/core';
import { SearchService } from '@search/services/search.service';
import { ItemVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
import { ngIfScaleHeightEnterAnimation } from '@shared/animations';
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

  @ViewChild('searchInput') inputElementRef: ElementRef;

  @HostBinding('class.showing-results') public showResults = false;
  public isFocused = false;

  public activeResultIndex = -1;

  constructor(
    private searchService: SearchService,
    private data: DataService
  ) { }

  ngOnInit(): void {
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
    const localLength = this.localResults?.length || 0;
    const globalLength = 0;

    if (!isArrow && event.keyCode !== ENTER) {
      return;
    }

    if (isArrow && this.localResults?.length) {
      const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
      const newActiveResultIndex = this.activeResultIndex + direction;
      this.activeResultIndex = Math.min(Math.max(-1, newActiveResultIndex), localLength + globalLength - 1);
    } else if (event.keyCode === ENTER) {
      console.log(event, this.activeResultIndex, this.localResults);
      if (-1 < this.activeResultIndex && this.activeResultIndex < this.localResults?.length) {
        // local result
        const item = this.localResults[this.activeResultIndex];
        console.log(item);
        this.onLocalResultClick(this.localResults[this.activeResultIndex]);
      } else if (this.activeResultIndex < this.globalResults?.length ) {
        // global result
      }
      this.reset();
      setTimeout(() => {
        (this.inputElementRef.nativeElement as HTMLInputElement).blur();
      }, 100);
    }
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
    this.searchTerm = null;
    this.showResults = false;
    this.localResults = null;
    this.globalResults = null;
    this.activeResultIndex = -1;
  }

  updateLocalResults(term: string) {
    this.localResults = this.searchService.getResultsInCurrentFolder(term, LOCAL_RESULTS_LIMIT);
  }

  onLocalResultClick(item: ItemVO) {
    this.data.showItem(item, true);
  }

}
