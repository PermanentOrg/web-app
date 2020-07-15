import { Component, OnInit, OnDestroy } from '@angular/core';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { ActivatedRoute, Router } from '@angular/router';

import debug from 'debug';
import { debugSubscribable } from '@shared/utilities/debug';
import { getLastChildRouteDataOperator } from '@shared/utilities/router';
import { Subscription, Observable } from 'rxjs';
import { unsubscribeAll, HasSubscriptions } from '@shared/utilities/hasSubscriptions';
import { map } from 'rxjs/operators';
interface FolderViewToggleOption {
  iconClass: 'reorder' | 'view_module';
  folderView: FolderView;
  tooltip?: string;
}

@Component({
  selector: 'pr-folder-view-toggle',
  templateUrl: './folder-view-toggle.component.html',
  styleUrls: ['./folder-view-toggle.component.scss']
})
export class FolderViewToggleComponent implements OnInit, OnDestroy, HasSubscriptions {
  currentFolderView: FolderView;
  folderViews: FolderViewToggleOption[] = [
    {
      iconClass: 'reorder',
      folderView: FolderView.List,
      tooltip: 'fileList.viewToggle.list'
    },
    {
      iconClass: 'view_module',
      folderView: FolderView.Grid,
      tooltip: 'fileList.viewToggle.grid'
    },
  ];

  showToggle: boolean;
  showToggle$: Observable<boolean>;

  private debug = debug('component:folderViewToggle');
  subscriptions: Subscription[] = [];
  constructor(
    private folderView: FolderViewService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentFolderView = this.folderView.folderView;
    this.debug('init view %o', this.currentFolderView);

    this.subscriptions.push(
      folderView.viewChange.subscribe(view => {
        this.currentFolderView = view;
      })
    );

    this.subscriptions.push(
      this.router.events.pipe(
        getLastChildRouteDataOperator(),
        map(routeData => !!routeData.showFolderViewToggle)
      ).subscribe(showToggle => {
        this.showToggle = showToggle;
        this.debug('show %o', this.showToggle);
      })
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  onFolderViewClick(option: FolderViewToggleOption) {
    this.debug('set view %o', option.folderView);
    this.folderView.setFolderView(option.folderView);
  }

}
