import { DOWN_ARROW, ENTER, UP_ARROW } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ArchiveVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { orderBy } from 'lodash';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'pr-archive-search-box',
  templateUrl: './archive-search-box.component.html',
  styleUrls: ['./archive-search-box.component.scss'],
})
export class ArchiveSearchBoxComponent implements OnInit {
  @Input() searchPublicArchives = false;
  @Input() filterFn: (a: ArchiveVO) => boolean;
  @Output() archiveSelect = new EventEmitter<ArchiveVO>();
  @Output() invite = new EventEmitter<string>();

  @ViewChild('input') inputElement: ElementRef;

  public focused = false;
  public searchText = null;
  public control = new UntypedFormControl('', [Validators.email]);
  public placeholderText = 'Search by email or archive name';

  public searchResults$: Observable<ArchiveVO[]>;
  public relationshipResults$: Observable<ArchiveVO[]>;
  public resultsCount: number = null;
  public results: ArchiveVO[] = null;

  public activeResultIndex = -1;

  constructor(
    @Optional() private relationshipService: RelationshipService,
    @Optional() private accountService: AccountService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.initFormHandler();
  }

  onInputKeydown(event: KeyboardEvent) {
    if (this.resultsCount === null) {
      return;
    }

    const isEnter = event.keyCode === ENTER;
    const isArrow = event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW;

    if (!this.resultsCount && this.control.valid) {
      if (isEnter) {
        this.onInvite(this.control.value);
      }
      return;
    } else if (!this.resultsCount) {
      return;
    }

    if (isArrow) {
      const direction = event.keyCode === DOWN_ARROW ? 1 : -1;
      const newActiveResultIndex = this.activeResultIndex + direction;
      this.activeResultIndex = Math.min(
        Math.max(-1, newActiveResultIndex),
        this.resultsCount - 1,
      );
    } else if (event.keyCode === ENTER) {
      this.onArchiveSelect(this.results[this.activeResultIndex]);
    }
  }

  searchArchives(text$: Observable<string>) {
    return text$.pipe(
      map((term) => {
        this.activeResultIndex = -1;
        if (!term && !this.focused) {
          this.resultsCount = null;
        }
        return term;
      }),
      debounceTime(100),
      switchMap((term) => {
        if (!term && !this.focused) {
          return of(null);
        } else if (!term && this.focused) {
          return of(
            this.relationshipService
              .getSync()
              .map((relation) => relation.RelationArchiveVO)
              .filter((a) => (this.filterFn ? this.filterFn(a) : true)),
          );
        } else if (!term.includes('@') && this.relationshipService) {
          return of(
            this.relationshipService
              .searchRelationsByName(term)
              .map((relation) => relation.RelationArchiveVO)
              .filter((a) => (this.filterFn ? this.filterFn(a) : true)),
          );
        } else if (this.control.valid) {
          return this.apiService.search.archiveByEmail(term).pipe(
            map((response) => {
              return response
                .getArchiveVOs()
                .filter(
                  (a) =>
                    a.archiveId !==
                    this.accountService?.getArchive()?.archiveId,
                );
            }),
          );
        } else {
          return of([]);
        }
      }),
      map((results) => {
        if (results) {
          this.resultsCount = results.length;
          results = orderBy(results, (a: ArchiveVO) =>
            a.fullName.toLowerCase(),
          );
        } else {
          this.resultsCount = null;
        }
        this.results = results;
        return results;
      }),
    );
  }

  initFormHandler() {
    this.searchResults$ = this.searchArchives(this.control.valueChanges);
  }

  onArchiveSelect(archive: ArchiveVO) {
    this.control.reset();
    this.archiveSelect.emit(archive);
    (this.inputElement.nativeElement as HTMLInputElement).blur();
  }

  onInvite(email: string) {
    this.control.reset();
    this.invite.emit(email);
    (this.inputElement.nativeElement as HTMLInputElement).blur();
  }

  onFocus() {
    this.focused = true;
    this.control.setValue('', { emitEvent: true });
  }

  onBlur() {
    setTimeout(() => {
      this.focused = true;
    }, 150);
  }
}
