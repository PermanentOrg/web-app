import {
  Component,
  Inject,
  OnInit,
  AfterContentInit,
  ElementRef,
  QueryList,
  ViewChildren,
  HostListener
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { debounce } from 'lodash';
import { FileListItemComponent } from '@core/components/file-list-item/file-list-item.component';

const NAV_HEIGHT = 50;
const ITEM_HEIGHT = 51;

@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, AfterContentInit {
  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  currentFolder: any;
  listItems: FileListItemComponent[];

  private viewportHeight;
  private scrollHandlerDebounced;

  constructor(private route: ActivatedRoute, @Inject(DOCUMENT) private document: any) {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.scrollHandlerDebounced = debounce(this.calculateListViewport.bind(this), 100);
  }

  ngOnInit() {
    const totalHeight = this.document.documentElement.clientHeight || this.document.body.clientHeight;
    this.viewportHeight = totalHeight - NAV_HEIGHT;
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.listItemsQuery) {
        this.listItems = this.listItemsQuery.toArray();
      }
    }, 0);
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.scrollHandlerDebounced();
  }

  calculateListViewport() {
    const top = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    const offset = Math.floor(top / ITEM_HEIGHT);
    const count = Math.ceil(this.viewportHeight / ITEM_HEIGHT);

    console.log('file-list.component.ts', 63, offset, count);
  }

}
