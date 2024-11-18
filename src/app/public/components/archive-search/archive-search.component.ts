/* @format */
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
export class ArchiveSearchComponent implements OnInit {
  @Output() search = new EventEmitter<string>();

  private archive: ArchiveVO;

  public searchForm: FormGroup;

  public waiting: boolean = false;

  public displayIcon: boolean = true;

  public searchResults = [];
  public tags = [];
  public filteredTags = [];

  public tag: TagVO[] = [];

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

  ngOnInit() {
    this.searchService
      .getPublicArchiveTags(this.archive.archiveId)
      .subscribe((res) => {
        this.tags = res;
      });
  }

  initFormHandler() {
    this.searchForm?.valueChanges
      ?.pipe(
        debounceTime(100),
        map((value) => value.query?.trim() || ''),
        tap((term) => {
          this.filteredTags = this.tags.filter((tag) =>
            tag.name.toLowerCase().includes(term.toLowerCase()),
          );
        }),
        switchMap((term) => {
          if (!term) {
            this.tag = [];
          }

          const archiveId = this.archive?.archiveId;
          if (term.length || this.filteredTags.length) {
            this.waiting = true;
            return this.searchService
              .getResultsInPublicArchive(
                term,
                this.tag.length ? this.tag : [],
                archiveId,
                3,
              )
              .pipe(
                catchError((err) => {
                  console.error(err);
                  return of(null);
                }),
              );
          } else {
            return of(null);
          }
        }),
      )
      .subscribe((response) => {
        this.waiting = false;

        if (response) {
          this.searchResults = response.ChildItemVOs;
        } else {
          this.searchResults = [];
          this.filteredTags = [];
        }
      });
  }

  public clearForm(): void {
    this.searchForm.reset();
  }

  public onHandleSearch(): void {
    this.search.emit(this.searchForm.value.query);
  }

  public onTagClick(tag: TagVO[]): void {
    this.searchForm.patchValue({ query: tag[0].name });
    this.tag = tag;
  }
}
