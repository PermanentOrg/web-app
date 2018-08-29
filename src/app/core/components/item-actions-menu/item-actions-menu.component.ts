import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse} from '@shared/services/api/index.repo';
import { FolderVO, RecordVO } from '@root/app/models';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'pr-item-actions',
  templateUrl: './item-actions-menu.component.html',
  styleUrls: ['./item-actions-menu.component.scss']
})
export class ItemActionsMenuComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public accountName: string;

  public item: FolderVO | RecordVO;
  public currentFolder: FolderVO;
  public allowedActions = {
    delete: false
  };

  constructor(
    private router: Router,
    private message: MessageService,
    private dataService: DataService,
    private api: ApiService,
    private fb: FormBuilder,
    private prompt: PromptService
  ) {
  }

  ngOnInit() {
    this.setAvailableActions();
  }

  setAvailableActions() {
    this.allowedActions.delete = this.currentFolder && !this.currentFolder.type.includes('app');
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    return false;
  }

  deleteItem() {

  }
}
