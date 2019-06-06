import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';

class Breadcrumb {
  public routerPath: string;
  constructor(rootUrl: string, public text: string, archiveNbr?: string, folder_linkId?: number) {

    if (!archiveNbr && !folder_linkId) {
      this.routerPath = this.getSpecialRouterPath(text).join('/');
      if (text === 'Shares') {
        this.text = 'Shared With Me';
      }
    } else {
      this.routerPath = [rootUrl, archiveNbr, folder_linkId].join('/');
    }
  }

  getSpecialRouterPath(displayText) {
    switch (displayText) {
      case 'My Files':
        return ['/myfiles'];
      case 'Apps':
        return ['/apps'];
      case 'Shares':
        return ['/shares/withme'];
      default:
        return ['/'];
    }
  }
}

@Component({
  selector: 'pr-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public currentFolder;
  public breadcrumbs;

  private scrollElement: Element;
  private folderChangeListener: Subscription;

  constructor(private dataService: DataService, private elementRef: ElementRef, private router: Router) {
  }

  ngOnInit() {
    this.scrollElement = this.elementRef.nativeElement.querySelector('.breadcrumbs');
    this.setFolder(this.dataService.currentFolder);
    setTimeout(() => {
      this.scrollToEnd();
    });

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

    let rootUrl;

    if (this.router.routerState.snapshot.url.includes('/apps')) {
      rootUrl = '/apps';
    } else if (this.router.routerState.snapshot.url.includes('/shares')) {
      rootUrl = '/shares';
    } else if  (this.router.routerState.snapshot.url.includes('/p')) {
      rootUrl = '/p';
    } else {
      rootUrl = '/myfiles';
    }

    if (!folder) {
      return;
    }

    if (!this.router.routerState.snapshot.url.includes('/p/')) {
      this.breadcrumbs.push(new Breadcrumb(rootUrl, folder.pathAsText[0]));
    }

    for (let i = 1; i < folder.pathAsText.length; i++) {
      this.breadcrumbs.push(new Breadcrumb(
        rootUrl,
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
