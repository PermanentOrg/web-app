import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-folder-view',
  templateUrl: './folder-view.component.html',
  styleUrls: ['./folder-view.component.scss']
})
export class FolderViewComponent implements OnInit, OnDestroy {
  public currentView: FolderView;
  private dataServiceSubscription: Subscription;
  constructor(
    private data: DataService
  ) {
    if (this.data.currentFolder) {
      this.currentView = data.currentFolder.view;
      console.log(this);
    }
    this.dataServiceSubscription = this.data.currentFolderChange.subscribe(folder => {
      this.currentView = folder.view;
      console.log(this);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dataServiceSubscription.unsubscribe();
  }

}
