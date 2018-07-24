import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';

class Breadcrumb {
  public routerPath: string;
  constructor(public text: string, archiveNbr?: string, folder_linkId?: number) {
    if (!archiveNbr && !folder_linkId) {
      this.routerPath = ['/myfiles'].join('/');
    } else {
      this.routerPath = ['/myfiles', archiveNbr, folder_linkId].join('/');
    }
  }
}

@Component({
  selector: 'pr-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  private currentFolder;
  private breadcrumbs;
  private scrollElement: Element;

  private folderChangeListener: Subscription;

  constructor(private dataService: DataService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.scrollElement = this.elementRef.nativeElement.querySelector('.breadcrumbs');
    this.setFolder(this.dataService.currentFolder);

    this.folderChangeListener = this.dataService.currentFolderChange.subscribe((folder: FolderVO) => {
      this.setFolder(folder);
      setTimeout(() => {
        this.scrollToEnd();
      }, 0);
    });
  }

  ngOnDestroy() {
    this.folderChangeListener.unsubscribe();
  }

  setFolder(folder) {
    this.currentFolder = folder;
    this.breadcrumbs = [];

    if (!folder) {
      return;
    }

    this.breadcrumbs.push(new Breadcrumb('My Files'));

    for (let i = 1; i < folder.pathAsText.length; i++) {
      this.breadcrumbs.push(new Breadcrumb(
        folder.pathAsText[i],
        folder.pathAsArchiveNbr[i],
        folder.pathAsFolder_linkId[i]
      ));
    }
  }

  scrollToEnd() {
    this.scrollElement.scrollLeft = this.scrollElement.scrollWidth - this.scrollElement.clientWidth;
  }

}
