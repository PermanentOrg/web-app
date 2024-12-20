/* @format */
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { FolderVO, RecordVO } from '@models/index';
import { SearchService } from '../../../search/services/search.service';

@Component({
  selector: 'pr-public-search-results',
  templateUrl: './public-search-results.component.html',
  styleUrls: ['./public-search-results.component.scss'],
})
export class PublicSearchResultsComponent implements OnInit, OnDestroy {
  public searchResults = [];
  public waiting = false;
  public query = '';

  public archivePath = ['..', '..', '..'];

  protected searchSubscription: Subscription;
  protected paramsSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    //get the query param from the route
    if (this.route.params) {
      this.paramsSubscription = this.route.params.subscribe((params) => {
        this.archivePath = ['/p/archive', params.publicArchiveNbr];
        this.query = params.query;
        this.searchSubscription = this.searchService
          .getResultsInPublicArchive(params.query, [], params.archiveId)
          .subscribe((response) => {
            if (response) {
              this.searchResults = response.ChildItemVOs;
              this.waiting = false;
            }
          });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchResultClick(item: RecordVO | FolderVO) {
    if (item.type === 'type.folder.public') {
      this.router.navigate([item.archiveNbr, item.folder_linkId], {
        relativeTo: this.route.parent,
      });
    } else {
      this.router.navigate(
        [
          item.parentArchiveNbr,
          item.parentFolder_linkId,
          'record',
          item.archiveNbr,
        ],
        {
          relativeTo: this.route.parent,
        },
      );
    }
  }
}
