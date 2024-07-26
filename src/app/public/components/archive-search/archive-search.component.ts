/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'pr-archive-search',
  templateUrl: './archive-search.component.html',
  styleUrls: ['./archive-search.component.scss'],
})
export class ArchiveSearchComponent {
  @Output() search = new EventEmitter<string>();

  public searchForm: FormGroup;

  public waiting: boolean = false;

  public displayIcon: boolean = true;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required]],
    });
  }

  public clearForm(): void {
    this.searchForm.reset();
  }

  public onHandleSearch(): void {
    this.search.emit(this.searchForm.value.query);
  }
}
