import { query } from '@angular/animations';
import { SearchService } from '@search/services/search.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'pr-archive-search',
  templateUrl: './archive-search.component.html',
  styleUrls: ['./archive-search.component.scss'],
})
export class ArchiveSearchComponent implements OnInit {

  @Output() search = new EventEmitter<string>()

  public searchForm: FormGroup;

  public waiting: boolean = false;

  public displayIcon: boolean = true;

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private searchService:SearchService
  ) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(100),
        switchMap((value) => {
          if (value.query && value.query.length > 3) {
            this.waiting = true;
            return this.searchService.getResultsInPublicArchive(
              value.query,
              [],
              '13',
              // 1000,
            );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((response) => {
        this.waiting = false;
        if (response) {
          console.log(response)
          // console.log(response.getArchiveVOs())
          // this.archiveResults = response.getArchiveVOs();
        } else {
          // this.archiveResults = null;
        }
        // this.activeResultIndex = -1;
        // this.showResults = this.archiveResults !== null;
      });
  }

  public clearForm(): void {
    this.searchForm.reset();
  }

  public onHandleSearch(): void {
    this.search.emit(this.searchForm.value.query);
  }

 
}
