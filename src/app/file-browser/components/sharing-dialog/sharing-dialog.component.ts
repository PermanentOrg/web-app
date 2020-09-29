import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ShareVO, ShareByUrlVO, ItemVO, ArchiveVO } from '@models';
import { AccessRoleType } from '@models/access-role';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.module';
import { Deferred } from '@root/vendor/deferred';
import { ngIfScaleAnimation, ngIfScaleAnimationDynamic, ngIfScaleHeightAnimation } from '@shared/animations';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import { ACCESS_ROLE_FIELD, DATE_FIELD, NUMBER_FIELD, ON_OFF_FIELD, PromptField, PromptService } from '@shared/services/prompt/prompt.service';
import { copyFromInputElement } from '@shared/utilities/forms';
import { indexOf, partition, remove } from 'lodash';

@Component({
  selector: 'pr-sharing-dialog',
  templateUrl: './sharing-dialog.component.html',
  styleUrls: ['./sharing-dialog.component.scss'],
  animations: [ ngIfScaleAnimation, ngIfScaleAnimationDynamic ]
})
export class SharingDialogComponent implements OnInit {
  public shareItem: ItemVO = null;

  public originalRoles = new Map<number, AccessRoleType>();
  public canShare = false;

  public shares: ShareVO[] = [];
  public pendingShares: ShareVO[] = [];

  public shareLink: ShareByUrlVO = null;
  public loadingRelations = false;

  public shareLinkForm: FormGroup;

  public linkCopied = false;
  public showLinkSettings = false;

  public newAccessRole: AccessRoleType = 'access.role.viewer';
  public accessRoleOptions: FormInputSelectOption[] = ACCESS_ROLE_FIELD.selectOptions;

  @ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private promptService: PromptService,
    private changeDet: ChangeDetectorRef,
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
      for (const share of this.shareItem.ShareVOs) {
        this.originalRoles.set(share.shareId, share.accessRole);
      }
      [ this.pendingShares, this.shares ] = partition(this.shareItem.ShareVOs, {status: 'status.generic.pending'}) as any;
    }

    this.canShare = this.shareItem.accessRole === 'access.role.owner';

    this.relationshipService.update();
  }

  setLinkSettingsFormValue(): void {
    if (this.shareLink) {

    } else {
      this.shareLinkForm.reset();
    }
  }

  onDoneClick(): void {
    this.shareItem.ShareVOs = [...this.shares, ...this.pendingShares];
    this.dialogRef.close();
  }

  onAddArchive(archive: ArchiveVO) {
    this.createShare(archive, this.newAccessRole);
  }

  onAddInvite(email: string) {
    console.log(email, this.newAccessRole);
  }

  confirmOwnerAdd(share: ShareVO) {
    return this.promptService.confirm(
      'Add owner',
      `Are you sure you share this item with The ${share.ArchiveVO.fullName} Archive as an owner?`,
    );
  }

  confirmRemove(share: ShareVO) {
    return this.promptService.confirm(
      'Remove from share',
      `Are you sure you want to remove The ${share.ArchiveVO.fullName} Archive?`,
      null,
      'btn-danger'
    );
  }

  onAccessChange(share: ShareVO) {
    if (share.accessRole as any === 'remove') {
      this.removeShare(share);
    } else {
      this.updateShare(share);
    }
  }

  async createShare(archive: ArchiveVO, accessRole: AccessRoleType) {
    const share = new ShareVO({});
    share.accessRole = accessRole;
    share.archiveId = archive.archiveId;
    share.folder_linkId = this.shareItem.folder_linkId;
    share.ArchiveVO = archive;

    if (share.accessRole === 'access.role.owner') {
      try {
        await this.confirmOwnerAdd(share);
      } catch (err) {
        return;
      }
    }

    try {
      share.isNewlyCreated = true;
      this.shares.push(share);
      const response = await this.api.share.upsert(share);
      share.isNewlyCreated = false;
      share.shareId = response.getShareVO().shareId;
      this.originalRoles.set(share.shareId, share.accessRole);
    } catch (err) {
      remove(this.shares, share);
      if (err instanceof ShareResponse) {
        this.messageService.showError(err.getMessage(), true);
      }
    }
  }

  async updateShare(share: ShareVO) {
    try {
      if (share.accessRole === 'access.role.owner') {
        await this.confirmOwnerAdd(share);
      }
      await this.api.share.upsert(share);
      this.originalRoles.set(share.shareId, share.accessRole);
    } catch (err) {
      share.accessRole = this.originalRoles.get(share.shareId);
      this.shares = [...this.shares];
      if (err instanceof ShareResponse) {
        this.messageService.showError(err.getMessage(), true);
      }
    }
  }

  async removeShare(share: ShareVO) {
    try {
      await this.confirmRemove(share);
    } catch (err) {
      share.accessRole = this.originalRoles.get(share.shareId);
      this.shares = [...this.shares];
      return;
    }

    try {
      share.isPendingAction = true;
      await this.api.share.remove(share);
      remove(this.shares, share);
      remove(this.pendingShares, share);
    } catch (err) {
      share.isPendingAction = false;
      if (err instanceof ShareResponse) {
        this.messageService.showError(err.getMessage(), true);
      }
    }
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
