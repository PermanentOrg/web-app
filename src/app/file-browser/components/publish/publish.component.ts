import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { RecordVO, FolderVO, ShareVO, ShareByUrlVO, ArchiveVO } from '@models/index';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { find } from 'lodash';
import { copyFromInputElement } from '@shared/utilities/forms';
import { PublicLinkPipe } from '@shared/pipes/public-link.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';

@Component({
  selector: 'pr-publish',
  templateUrl: './publish.component.html',
  styleUrls: ['./publish.component.scss']
})
export class PublishComponent implements OnInit {
  public sourceItem: RecordVO | FolderVO = null;
  public publicItem: RecordVO | FolderVO = null;

  public publicLink: string = null;

  public waiting = false;
  public linkCopied = false;

  @ViewChild('publicLinkInput', { static: false }) publicLinkInput: ElementRef;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private account: AccountService,
    private ga: GoogleAnalyticsService,
    private api: ApiService,
    private messageService: MessageService,
    private accountService: AccountService,
    private linkPipe: PublicLinkPipe
  ) {
    this.sourceItem = this.data.item as FolderVO | RecordVO;

    if (this.sourceItem.folder_linkType.includes('public')) {
      this.publicItem = this.sourceItem;
      this.publicLink =  this.linkPipe.transform(this.publicItem);
    }
  }

  ngOnInit() {
  }

  async publishItem() {
    if (this.sourceItem.type.includes('public')) {
      return;
    }

    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.initiated);

    this.waiting = true;
    try {
      const publicRoot = find(this.accountService.getRootFolder().ChildItemVOs, { type: 'type.folder.root.public'}) as FolderVO;
      if (this.sourceItem instanceof FolderVO) {
        const response = await this.api.folder.copy([this.sourceItem], publicRoot);
        this.publicItem = response.getFolderVO();
      } else {
        const response = await this.api.record.copy([this.sourceItem], publicRoot);
        this.publicItem = response.getRecordVO();
      }
      this.publicLink = this.linkPipe.transform(this.publicItem);
    } catch (err) {
      if (err.getMessage) {
        this.messageService.showError(err.getMessage());
      }
    } finally {
      this.waiting = false;
    }
  }

  copyPublicLink() {
    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.getLink);

    const element = this.publicLinkInput.nativeElement as HTMLInputElement;

    copyFromInputElement(element);

    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
    }, 5000);
  }

  close() {
    this.dialogRef.close();
  }
}
