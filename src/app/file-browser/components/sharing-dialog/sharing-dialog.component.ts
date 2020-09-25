import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { RecordVO, FolderVO, ShareVO, ShareByUrlVO, ItemVO } from '@models';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { ApiService } from '@shared/services/api/api.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { partition } from 'lodash';

@Component({
  selector: 'pr-sharing-dialog',
  templateUrl: './sharing-dialog.component.html',
  styleUrls: ['./sharing-dialog.component.scss']
})
export class SharingDialogComponent implements OnInit {
  public shareItem: ItemVO = null;

  public shares: ShareVO[] = [];
  public pendingShares: ShareVO[] = [];

  public shareLink: ShareByUrlVO = null;
  public loadingRelations = false;

  public linkCopied = false;

  @ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private dialog: Dialog,
    private route: ActivatedRoute,
    private promptService: PromptService,
    private api: ApiService,
    private messageService: MessageService,
    private relationshipService: RelationshipService,
    private ga: GoogleAnalyticsService
  ) { }

  ngOnInit(): void {
    this.shareItem = this.data.item as ItemVO;
    this.shareLink = this.data.link;

    if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
      [ this.pendingShares, this.shares ] = partition(this.shareItem.ShareVOs, {status: 'status.generic.pending'}) as any;
    }
  }

  onDoneClick(): void {
    this.dialogRef.close();
  }

}
