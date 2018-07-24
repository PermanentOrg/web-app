import {
  Component,
  Inject,
  OnInit,
  AfterContentInit,
  ElementRef,
  QueryList,
  ViewChildren,
  HostListener,
  OnDestroy
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { debounce } from 'lodash';

import { FileListItemComponent } from '@core/components/file-list-item/file-list-item.component';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models/folder-vo';
import { RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

const NAV_HEIGHT = 50;
const ITEM_HEIGHT = 51;
const SCROLL_DEBOUNCE = 150;

@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  currentFolder: FolderVO;
  listItems: FileListItemComponent[];

  private viewportHeight;
  private scrollHandlerDebounced;
  private itemsFetchedCount;
  private routeListener: Subscription;
  private reinit = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    @Inject(DOCUMENT) private document: any
  ) {
    this.scrollHandlerDebounced = debounce(this.calculateListViewport.bind(this), SCROLL_DEBOUNCE);
    if (!this.routeListener) {
      this.routeListener = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd ))
      .subscribe((event) => {
        if (this.reinit) {
          this.ngOnInit();
          setTimeout(() => {
            this.ngAfterContentInit();
          }, 0);
        }
      });
    }
  }

  ngOnInit() {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.dataService.setCurrentFolder(this.currentFolder);

    const totalHeight = this.document.documentElement.clientHeight || this.document.body.clientHeight;
    this.viewportHeight = totalHeight - NAV_HEIGHT;

    this.itemsFetchedCount = 0;
    this.reinit = true;
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.listItemsQuery) {
        this.listItems = this.listItemsQuery.toArray();
      }

      this.document.documentElement.scrollTop = 0;
      this.calculateListViewport();
    }, 0);
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    this.routeListener.unsubscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.scrollHandlerDebounced();
  }

  calculateListViewport() {
    if (this.itemsFetchedCount >= this.currentFolder.ChildItemVOs.length) {
      return;
    }

    const top = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    const offset = Math.floor(top / ITEM_HEIGHT);
    const count = Math.ceil(this.viewportHeight / ITEM_HEIGHT);

    const itemsToFetch = this.currentFolder.ChildItemVOs
      .slice(offset, offset + count)
      .filter((item: FolderVO | RecordVO) => {
        return !item.isFetching && item.dataStatus < DataStatus.Lean;
      });

    this.dataService.fetchLeanItems(itemsToFetch)
      .then((fetchedCount: number) => {
        this.itemsFetchedCount += fetchedCount;
      })
      .catch((response) => {
        console.error(response);
      });
  }

}
