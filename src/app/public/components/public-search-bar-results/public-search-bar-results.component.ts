import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pr-public-search-bar-results',
  templateUrl: './public-search-bar-results.component.html',
  styleUrl: './public-search-bar-results.component.scss',
})
export class PublicSearchBarResultsComponent implements OnInit {
  @Input() searchResults = [];
  @Input() tags = [];

  public types = {
    'type.folder.private': 'Folder',
    'type.folder.public': 'Folder',
    'type.record.image': 'Image',
    'type.record.video': 'Video',
  };

  ngOnInit(): void {
    console.log(this.searchResults)
  }

}
