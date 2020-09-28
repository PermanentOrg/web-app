import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ShareVO, ShareByUrlVO, ItemVO, ArchiveVO } from '@models';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { Deferred } from '@root/vendor/deferred';
import { ngIfScaleAnimation, ngIfScaleHeightAnimation } from '@shared/animations';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import { DATE_FIELD, NUMBER_FIELD, ON_OFF_FIELD, PromptField, PromptService } from '@shared/services/prompt/prompt.service';
import { copyFromInputElement } from '@shared/utilities/forms';
import { partition } from 'lodash';

@Component({
  selector: 'pr-sharing-dialog',
  templateUrl: './sharing-dialog.component.html',
  styleUrls: ['./sharing-dialog.component.scss'],
  animations: [ ngIfScaleAnimation ]
})
export class SharingDialogComponent implements OnInit {
  public shareItem: ItemVO = null;

  public shares: ShareVO[] = [];
  public pendingShares: ShareVO[] = [];

  public shareLink: ShareByUrlVO = null;
  public loadingRelations = false;

  public shareLinkForm: FormGroup;

  public linkCopied = false;

  public showLinkSettings = false;

  @ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private dialog: Dialog,
    private route: ActivatedRoute,
    private promptService: PromptService,
    private fb: FormBuilder,
    private api: ApiService,
    private messageService: MessageService,
    private relationshipService: RelationshipService,
    private ga: GoogleAnalyticsService
  ) {
    this.shareLinkForm = this.fb.group({
      expiresDT: [null]
    });
  }

  ngOnInit(): void {
    this.shareItem = this.data.item as ItemVO;
    this.shareLink = this.data.link;

    if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
      [ this.pendingShares, this.shares ] = partition(this.shareItem.ShareVOs, {status: 'status.generic.pending'}) as any;
    }

    this.relationshipService.update();
  }

  setLinkSettingsFormValue(): void {
    if (this.shareLink) {

    } else {
      this.shareLinkForm.reset();
    }
  }

  onDoneClick(): void {
    this.dialogRef.close();
  }

  onAddArchive(archive: ArchiveVO) {
    console.log(archive);
  }

  onAddInvite(email: string) {
    console.log(email);
  }

  async generateShareLink() {
    const response = await this.api.share.generateShareLink(this.shareItem);

    if (response.isSuccessful) {
      this.shareLink = response.getShareByUrlVO();
      this.ga.sendEvent(EVENTS.SHARE.ShareByUrl.initiated.params);
    }
  }

  copyShareLink() {
    const element = this.shareUrlInput.nativeElement as HTMLInputElement;

    copyFromInputElement(element);

    this.linkCopied = true;
    setTimeout(() => {
      this.linkCopied = false;
    }, 5000);
  }

  manageShareLink() {
    const deferred = new Deferred();
    const title = `Manage share link for ${this.shareItem.displayName}`;
    let currentDate = null;
    if (this.shareLink.expiresDT) {
      currentDate = new Date(this.shareLink.expiresDT).toISOString().split('T')[0];
    }
    const fields: PromptField[] = [
      ON_OFF_FIELD('previewToggle', 'Share preview', this.shareLink.previewToggle ? 'on' : 'off'),
      NUMBER_FIELD('maxUses', 'Max number of uses (optional)', this.shareLink.maxUses, false),
      DATE_FIELD('expiresDT', 'Expiration date (optional)', currentDate, new Date())
    ];

    this.promptService.prompt(fields, title, deferred.promise, 'Save')
    .then(async (result: {previewToggle: 'on' | 'off', expiresDT, maxUses: string}) => {
      const updatedShareVo = new ShareByUrlVO(this.shareLink);
      updatedShareVo.previewToggle = result.previewToggle === 'on' ? 1 : 0;

      if (result.maxUses !== undefined) {
        updatedShareVo.maxUses = parseInt(result.maxUses, 10);
      }

      if (result.expiresDT) {
        updatedShareVo.expiresDT = new Date(result.expiresDT).toISOString();
      }

      try {
        const updateResponse = await this.api.share.updateShareLink(updatedShareVo);
        this.shareLink = updateResponse.getShareByUrlVO();
        deferred.resolve();
      } catch (response) {
        deferred.reject();
        if (response.getMessage()) {
          this.messageService.showError(response.getMessage());
        }
      }
    })
    .catch((err) => {
      if (err instanceof ShareResponse) {
      } else {
        console.error(err);
      }
    });
  }

  async removeShareLink() {
    const deferred = new Deferred();
    try {
      await this.promptService.confirm(
        'Remove link',
        'Are you sure you want to remove this link?',
        deferred.promise,
        'btn-danger'
      );

      await this.api.share.removeShareLink(this.shareLink);
      this.shareLink = null;
      deferred.resolve();
    } catch (response) {
      deferred.resolve();
      if (response instanceof ShareResponse) {
        this.messageService.showError(response.getMessage());
      }
    }
  }

}
