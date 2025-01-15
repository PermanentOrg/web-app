/* @format */
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArchiveVO, TagVO, TagVOData } from '@models/index';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { SearchService } from '@search/services/search.service';
import {
  catchError,
  debounceTime,
  map,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'pr-archive-search',
  templateUrl: './archive-search.component.html',
  styleUrls: ['./archive-search.component.scss'],
})
export class ArchiveSearchComponent implements OnInit {
  @Output() search = new EventEmitter<string>();
  @Output() searchByTag = new EventEmitter<number>();

  public archive: ArchiveVO;
  private valueChangesSubscription: Subscription;

  public searchForm: FormGroup;

  public waiting: boolean = false;

  public displayIcon: boolean = true;

  public searchResults = [];
  public tags = [];
  public filteredTags = [];

  public tag: TagVOData[] = [];

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
    const valueChangesSubscription = this.searchForm?.valueChanges
      ?.pipe(
        debounceTime(100),
        map((term) => {
          return this.searchService.parseSearchTerm(term.query);
        }),
        tap(([term, tags]) => {
          let value = term ? term : tags[0]?.name;
          this.filteredTags = this.tags.filter((tag) =>
            tag.name.toLowerCase().includes(value?.toLowerCase()),
          );
        }),
        switchMap(([term, tags]) => {
          if (!term && !tags.length) {
            this.tag = [];
          } else {
            this.tag = tags;
          }

          const archiveId = this.archive?.archiveId;
          if (term?.length || this.filteredTags.length) {
            this.waiting = true;

            return this.searchService
              .getResultsInPublicArchive(
                term ? term : '',
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
    this.valueChangesSubscription = valueChangesSubscription;
  }

  public clearForm(): void {
    this.searchForm.reset();
  }

  public onHandleSearch(): void {
    this.search.emit(this.searchForm.value.query);
  }

  public onTagClick(tag: TagVO[]): void {
    this.tag = tag;
    this.searchByTag.emit(tag[0].tagId);

    this.valueChangesSubscription.unsubscribe();
    this.searchForm.patchValue({ query: `tag:"${tag[0].name}"` });

    this.initFormHandler();
  }
}
