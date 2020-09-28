import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ArchiveVO } from '@models';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api/api.service';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'pr-archive-search-box',
  templateUrl: './archive-search-box.component.html',
  styleUrls: ['./archive-search-box.component.scss']
})
export class ArchiveSearchBoxComponent implements OnInit {
  @Input() searchPublicArchives = false;
  @Output() archiveSelect = new EventEmitter<ArchiveVO>();
  @Output() invite = new EventEmitter<string>();

  public searchText = null;
  public control = new FormControl('', [Validators.email]);
  public placeholderText = 'Search by email or archive name';

  public searchResults$: Observable<ArchiveVO[]>;
  public relationshipResults$: Observable<ArchiveVO[]>;
  public resultsCount: number = null;

  constructor(
    @Optional() private relationshipService: RelationshipService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.initFormHandler();
  }

  searchArchives(text$: Observable<string>) {
    return text$.pipe(
      map(term => {
        if (!term) {
          this.resultsCount = null;
        }
        return term;
      }),
      debounceTime(100),
      switchMap((term) => {
        if (!term) {
          return of(null);
        } if (!term.includes('@') && this.relationshipService) {
          return of(
            this.relationshipService.searchRelationsByName(term)
              .map(relation => relation.RelationArchiveVO)
            );
        } else if (this.control.valid) {
            return this.apiService.search.archiveByEmail(term)
            .pipe(
              map(response => {
                return response.getArchiveVOs();
              })
            );
        } else {
          return of([]);
        }
      }),
      map(results => {
        if (results) {
          this.resultsCount = results.length;
        } else {
          this.resultsCount = null;
        }
        return results;
      })
    );
  }

  initFormHandler() {
    this.searchResults$ = this.searchArchives(this.control.valueChanges);
  }

  onArchiveSelect(archive: ArchiveVO) {
    this.control.reset();
    this.archiveSelect.emit(archive);
  }

  onInvite(email: string) {
    this.control.reset();
    this.invite.emit(email);
  }
}
