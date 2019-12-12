import { Component, OnInit, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { of } from 'rxjs';

const ANIMATION_DURATION = 1000;

@Component({
  selector: 'pr-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, AfterViewInit {
  public searchForm: FormGroup;

  public archiveResults: ArchiveVO[];

  public showInput = false;
  @HostBinding('class.search-box-active') public searchBoxActive = false;
  public showResults = false;

  @ViewChild('searchInput') searchInputRef: ElementRef;
  @Output() searchBarFocusChange = new EventEmitter();

constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      'query': [ '', [ Validators.required ]]
    });
  }

  ngOnInit() {
    this.searchForm.valueChanges.pipe(
      debounceTime(100),
      switchMap((value) => {
        if (value.query && value.query.length > 3) {
          return this.api.search.archiveByNameObservable(value.query);
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      if (response) {
        this.archiveResults = response.getArchiveVOs();
      } else {
        this.archiveResults = null;
      }
      this.showResults = this.archiveResults !== null;
    });
  }

  ngAfterViewInit() {
  }

  onSearchButtonClick() {
    this.searchBoxActive = true;
  }

  onCancelButtonClick() {
    this.searchBoxActive = false;
  }

  async search(query: string) {
    try {
      const response = await this.api.search.archiveByName(query);
      this.archiveResults = response.getArchiveVOs();
    } catch (err) {
      console.error('search err', err);
    }
  }

  onArchiveClick(archive: ArchiveVO) {
    this.router.navigate(['/p', 'archive', archive.archiveNbr]);
    this.showResults = false;
    this.searchForm.reset();
    this.searchBoxActive = false;
  }
}
