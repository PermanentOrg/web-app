import { Component, OnInit, Input, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, RouterState } from '@angular/router';

import { clone } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { PromptService, PromptButton, PromptField } from '@core/services/prompt/prompt.service';

import { FolderVO, RecordVO, FolderVOData, RecordVOData } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { RecordResponse, FolderResponse } from '@shared/services/api/index.repo';
import { Validators } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-file-list-item',
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent implements OnInit, OnDestroy {
  @Input() item: FolderVO | RecordVO;
  public allowActions = true;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    public element: ElementRef,
    private message: MessageService,
    private prompt: PromptService,
    private edit: EditService
  ) {
  }

  ngOnInit() {
    this.dataService.registerItem(this.item);
    if (this.item.type.includes('app')) {
      this.allowActions = false;
    }
  }

  ngOnDestroy() {
    this.dataService.deregisterItem(this.item);
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

    let actionResolve;

    const actionPromise = new Promise((resolve) => {
      actionResolve = resolve;
    });

    actionButtons = [
      {
        buttonName: 'delete',
        buttonText: 'Delete',
        class: 'btn-danger'
      },
      {
        buttonName: 'rename',
        buttonText: 'Rename',
      },
      {
        buttonName: 'download',
        buttonText: 'Download'
      }
    ];

    this.prompt.promptButtons(actionButtons, this.item.displayName, actionPromise)
      .then((value: string) => {
        switch (value) {
          case 'delete':
            return this.deleteItem(actionResolve);
          case 'rename':
            actionResolve();
            this.promptForUpdate();
            break;
          case 'download':
            this.dataService.downloadFile(this.item as RecordVO)
              .then(() => {
                actionResolve();
              });
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

  promptForUpdate() {
    let updateResolve;

    const updatePromise = new Promise((resolve) => {
      updateResolve = resolve;
    });

    const fields: PromptField[] = [
      {
        fieldName: 'displayName',
        validators: [Validators.required],
        placeholder: 'Name',
        initialValue: this.item.displayName,
        config: {
          autocapitalize: 'off',
          autocorrect: 'off',
          autocomplete: 'off',
          spellcheck: 'off'
        }
      }
    ];

    this.prompt.prompt(fields, `Rename "${this.item.displayName}"`, updatePromise, 'Save', 'Cancel')
      .then((values) => {
        this.saveUpdates(values, updateResolve);
      });
  }

  saveUpdates(changes: RecordVOData | FolderVOData, resolve: Function) {
    const originalData = {};
    Object.keys(changes)
      .forEach((key) => {
        if (this.item[key] === changes[key]) {
          delete changes[key];
        } else {
          originalData[key] = this.item[key];
        }
      });

    if (!Object.keys(changes).length) {
      return resolve();
    } else {
      this.item.update(changes);
      return this.edit.updateItems([this.item])
        .then(() => {
          resolve();
        })
        .catch((response: RecordResponse | FolderResponse) => {
          resolve();
          this.message.showError(response.getMessage(), true);
          this.item.update(originalData);
        });
    }
  }


}
