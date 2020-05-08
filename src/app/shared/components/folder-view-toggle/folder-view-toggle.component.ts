import { Component, OnInit } from '@angular/core';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';

interface FolderViewToggleOption {
  iconClass: 'ion-md-list' | 'ion-md-grid';
  folderView: FolderView;
}

@Component({
  selector: 'pr-folder-view-toggle',
  templateUrl: './folder-view-toggle.component.html',
  styleUrls: ['./folder-view-toggle.component.scss']
})
export class FolderViewToggleComponent implements OnInit {
  currentFolderView: FolderView;
  folderViews: FolderViewToggleOption[] = [
    {
      iconClass: 'ion-md-list',
      folderView: FolderView.List
    },
    {
      iconClass: 'ion-md-grid',
      folderView: FolderView.Grid
    },
  ];

  constructor(
    private folderView: FolderViewService
  ) {
    this.currentFolderView = this.folderView.folderView;
    folderView.viewChange.subscribe(view => {
      this.currentFolderView = view;
    });
  }

  ngOnInit(): void {
  }

  onFolderViewClick(option: FolderViewToggleOption) {
    this.folderView.setFolderView(option.folderView);
  }

}
