import { Component, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';

import { FolderVO, RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnDestroy {
  @Input() item: FolderVO | RecordVO;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    public element: ElementRef,
    private prompt: PromptService,
    private edit: EditService
  ) {
  }

  goToItem() {
    if (this.item.dataStatus < DataStatus.Lean) {
      if (!this.item.isFetching) {
        this.dataService.fetchLeanItems([this.item]);
      }

      return this.item.fetched.then((fetched) => {
        this.goToItem();
      });
    }

    let rootUrl;

    if (this.router.routerState.snapshot.url.includes('/apps')) {
      rootUrl = '/apps';
    } else {
      rootUrl = '/myfiles';
    }

    if (this.item.isFolder) {
      this.router.navigate([rootUrl, this.item.archiveNbr, this.item.folder_linkId], {relativeTo: this.route});
    } else {
      this.router.navigate(['record', this.item.archiveNbr], {relativeTo: this.route});
    }
  }

  showActions(event: Event) {
    event.stopPropagation();

    let actionButtons: PromptButton[];

    let deleteResolve, deleteReject;

    const deletePromise = new Promise((resolve, reject) => {
      deleteResolve = resolve;
      deleteReject = reject;
    });

    actionButtons = [
      {
        buttonName: 'delete',
        buttonText: 'Delete',
        class: 'btn-danger'
      }
    ];

    this.prompt.promptButtons(actionButtons, this.item.displayName, deletePromise)
      .then((value: string) => {
        switch (value) {
          case 'delete':
            this.deleteItem(deleteResolve);
            break;
        }
      });

    return false;
  }

  deleteItem(resolve: Function) {
    return this.edit.deleteItems([this.item])
      .then(() => {
        this.dataService.refreshCurrentFolder();
        resolve();
      })
      .catch(() => {
        resolve();
      });
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
  }

}
