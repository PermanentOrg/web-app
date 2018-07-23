import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  currentFolder: any;

  constructor(private route: ActivatedRoute) {
    this.currentFolder = this.route.snapshot.data.currentFolder;
  }

  ngOnInit() {
  }

}
