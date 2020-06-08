import { Component, OnInit, Input } from '@angular/core';
import { FolderViewType, ItemVO, FolderVO } from '@models';
import { Router } from '@angular/router';
import { environment } from '@root/environments/environment';


@Component({
  selector: 'pr-sidebar-view-option',
  templateUrl: './sidebar-view-option.component.html',
  styleUrls: ['./sidebar-view-option.component.scss']
})
export class SidebarViewOptionComponent implements OnInit {
  @Input() folderView: FolderViewType;
  @Input() folder: FolderVO;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }
}
