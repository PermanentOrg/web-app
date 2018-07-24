import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';

@Component({
  selector: 'pr-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  private currentFolder;

  constructor(private router: Router, private dataService: DataService) {
    dataService.currentFolderChange.subscribe((folder) => {
      this.currentFolder = folder;
    });
  }

  ngOnInit() {
  }

}
