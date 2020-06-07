import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@models';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'pr-global-search-results',
  templateUrl: './global-search-results.component.html',
  styleUrls: ['./global-search-results.component.scss']
})
export class GlobalSearchResultsComponent implements OnInit {
  @ViewChild('searchInput') inputElementRef: ElementRef;
  public formControl: FormControl;

  constructor(
    private data: DataService,
    private fb: FormBuilder,

  ) {
    this.data.setCurrentFolder(new FolderVO({
      displayName: 'Search',
      pathAsText: ['Search'],
      type: 'page'
    }));

    this.formControl = this.fb.control('');
  }

  ngOnInit(): void {
  }

}
