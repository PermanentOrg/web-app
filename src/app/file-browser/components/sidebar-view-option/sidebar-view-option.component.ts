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
  styleUrls: ['./sidebar-view-option.component.scss']
})
export class SidebarViewOptionComponent implements OnInit {
  @Input() folderView: FolderViewType;
  @Input() folder: FolderVO;
  @Input() folderDefault: FolderViewType;

  @Output() setDefault = new EventEmitter<FolderViewType>();

  get isDefault(): boolean {
    return this.folderDefault === this.folderView;
  }

  set isDefault(value: boolean) {
    if (value) {
      this.onSetDefault();
    }
  }

  images: FolderViewImages = {
    'folder.view.grid': 'assets/img/views/grid.png',
    'folder.view.timeline': 'assets/img/views/timeline.png'
  };

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onSetDefault() {
    if (this.folderDefault === this.folderView) {
      return;
    } else {
      this.setDefault.emit(this.folderView);
    }
  }
}
