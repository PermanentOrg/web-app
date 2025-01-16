import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FolderViewType, ItemVO, FolderVO } from '@models';
import { Router } from '@angular/router';
import { environment } from '@root/environments/environment';

type FolderViewImages = {
  [Type in FolderViewType]?: string;
};

@Component({
  selector: 'pr-sidebar-view-option',
  templateUrl: './sidebar-view-option.component.html',
  styleUrls: ['./sidebar-view-option.component.scss'],
})
export class SidebarViewOptionComponent {
  @Input() folderView: FolderViewType;
  @Input() folder: FolderVO;

  @Output() setDefault = new EventEmitter<FolderViewType>();

  radioId = `folder-view-checkbox-${Math.random().toString(36).substr(2, 5)}`;

  images: FolderViewImages = {
    'folder.view.grid': 'assets/img/views/grid.png',
    'folder.view.timeline': 'assets/img/views/timeline.png',
  };

  constructor() {}
}
