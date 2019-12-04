import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'pr-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      'query': [ '', [ Validators.required ]]
    });
  }

  ngOnInit() {
  }

}
