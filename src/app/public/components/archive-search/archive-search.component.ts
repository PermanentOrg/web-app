/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArchiveVO, TagVO } from '@models/index';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { SearchService } from '@search/services/search.service';
import { catchError, debounceTime, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'pr-archive-search',
  templateUrl: './archive-search.component.html',
  styleUrls: ['./archive-search.component.scss'],
})
export class ArchiveSearchComponent {
  @Output() search = new EventEmitter<string>();

  private archive: ArchiveVO;

  public searchForm: FormGroup;

  public waiting: boolean = false;

  public displayIcon: boolean = true;

  public searchResults = [];

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService,
    private publicProfile: PublicProfileService,
  ) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required]],
    });

    this.publicProfile
      .archive$()
      .subscribe((archive) => (this.archive = archive));

    this.initFormHandler();
  }

  initFormHandler() {
    this.searchForm.valueChanges
      .pipe(
        map((term) => {
          console.log('term', term);
          return this.searchService.parseSearchTerm(term.query);
        }),
        tap(([term, tags]) => {
          console.log('term', term);
          console.log('tags', tags);

          // this.showResults = true;
          // this.updateLocalResults(term as string, tags);
          // this.updateTagsResults(term as string, tags);
        }),
        debounceTime(100),
        switchMap(([term, tags]) => {
          const archiveId = this.archive?.archiveId;

          console.log(archiveId);

          const tagstest = this.searchService.getTagResults('asd');

          console.log('tagstest', tagstest);

          if (term?.length || tags?.length) {
            this.waiting = true;
            return this.searchService
              .getResultsInPublicArchive(term, [], archiveId, 10)
              .pipe(
                catchError((err) => {
                  return of(err);
                }),
              );
          } else {
            return of(null);
          }
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.waiting = false;
          this.searchResults = response.ChildItemVOs;
        }
      });
  }

  public clearForm(): void {
    this.searchForm.reset();
  }

  public onHandleSearch(): void {
    this.search.emit(this.searchForm.value.query);
  }
}
