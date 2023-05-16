import { query } from '@angular/animations';
import { SearchService } from '../search/services/search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'pr-public-search-results',
  templateUrl: './public-search-results.component.html',
  styleUrls: ['./public-search-results.component.scss']
})
export class PublicSearchResultsComponent implements OnInit {

  searchResults = []
  waiting = false
  query = ''

  types = {
    'type.folder.private':'Folder',
    'type.folder.public':'Folder',
    'type.record.image':'Image',
    'type.record.video':'Video',
  }

  

  constructor(private router:Router, private route:ActivatedRoute, private searchService: SearchService, private location: Location) { }

  ngOnInit(): void {

    //get the query param from the route
    this.route.params.subscribe(params => {
        this.searchService
        .getResultsInPublicArchive(
          params.query,
          [],
          params.archiveId
        )
        .subscribe((response) => {
          if (response) {
            this.searchResults = response.ChildItemVOs;
            this.waiting = false; 
            this.query = params.query;

            console.log(this.searchResults)
          }
        });
    })
    
    
  }

  backToArchive(){
    this.location.back();
  }

  onSearchResultClick(item){
    if(item.type === 'type.folder.public'){
      this.router.navigate([item.archiveNbr, item.folder_linkId], {
        relativeTo: this.route.parent,
      });
    }
    else{
    this.router.navigate(['record', item.archiveNbr], {
      relativeTo: this.route.parent,
    });
  }}

}
