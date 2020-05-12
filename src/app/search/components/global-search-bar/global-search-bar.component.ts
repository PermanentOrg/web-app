import { Component, OnInit } from '@angular/core';
import { SearchService } from '@search/services/search.service';

@Component({
  selector: 'pr-global-search-bar',
  templateUrl: './global-search-bar.component.html',
  styleUrls: ['./global-search-bar.component.css']
})
export class GlobalSearchBarComponent implements OnInit {
  public searchTerm: string;
  constructor(
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
  }

  search(term: string) {
    this.searchService.getResultsInCurrentFolder(term);
  }

}
