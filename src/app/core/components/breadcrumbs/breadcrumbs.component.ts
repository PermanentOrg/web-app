import { Component, OnInit } from '@angular/core';
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
export class BreadcrumbsComponent implements OnInit {
  private currentFolder;
  private breadcrumbs;

  constructor(private dataService: DataService) {
    dataService.currentFolderChange.subscribe((folder: FolderVO) => {
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

      console.log('breadcrumbs.component.ts', 39, this.breadcrumbs);
    });
  }

  ngOnInit() {
  }

}
