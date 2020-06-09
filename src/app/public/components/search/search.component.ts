import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveVO } from '@models';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;

  results: ArchiveVO[];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      'query': [ '', [ Validators.required ]]
    });
  }

  ngOnInit() {
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
    ).subscribe(value => {
      if (value.query) {
        this.search(value.query);
      } else {
        this.results = null;
      }
    });
  }

  async search(query: string) {
    try {
      const response = await this.api.search.archiveByName(query);
      this.results = response.getArchiveVOs();
    } catch (err) {
      console.error('search err', err);
    }
  }

  onArchiveClick(archive: ArchiveVO) {
    this.router.navigate(['/p', 'archive', archive.archiveNbr]);
  }

}
