import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';

import { remove, find, partition } from 'lodash';
import { Deferred } from '@root/vendor/deferred';

import { PromptButton, PromptService, PromptField } from '@shared/services/prompt/prompt.service';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { DeviceService } from '@shared/services/device/device.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';

import { RecordVO, FolderVO, ShareVO, ArchiveVO, ShareByUrlVO, ItemVO } from '@models';
import { ArchivePickerComponentConfig } from '@shared/components/archive-picker/archive-picker.component';
import { ACCESS_ROLE_FIELD_INITIAL, ON_OFF_FIELD, NUMBER_FIELD, DATE_FIELD } from '@shared/components/prompt/prompt-fields';
import { ActivatedRoute } from '@angular/router';
import { EVENTS } from '@shared/services/google-analytics/events';
import { copyFromInputElement } from '@shared/utilities/forms';

const ShareActions: {[key: string]: PromptButton} = {
  ChangeAccess: {
    buttonName: 'edit',
    buttonText: 'Edit Access'
  },
  Remove: {
    buttonName: 'remove',
    buttonText: 'Remove',
    class: 'btn-danger'
  },
  Decline: {
    buttonName: 'remove',
    buttonText: 'Decline',
    class: 'btn-danger'
  },
  Approve: {
    buttonName: 'approve',
    buttonText: 'Approve'
  }
};

@Component({
  selector: 'pr-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss']
})
export class SharingComponent implements OnInit {
  public shareItem: RecordVO | FolderVO = null;

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
  ) {
    this.shareItem = this.data.item as ItemVO;
    this.shareLink = this.data.link;

    if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
      [ this.pendingShares, this.shares ] = partition(this.shareItem.ShareVOs, {status: 'status.generic.pending'}) as any;
    }
  }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams.shareArchiveNbr && queryParams.requestToken) {
      if (this.shareItem.archiveNbr === queryParams.shareArchiveNbr) {
        const targetRequest: any = find(this.shareItem.ShareVOs, { requestToken: queryParams.requestToken }) as any;
        if (!targetRequest) {
          this.messageService.showError('Share request not found.');
        } else if (targetRequest.status.includes('ok')) {
          this.messageService.showMessage(`Share request for ${targetRequest.ArchiveVO.fullName} already approved.`);
        } else {
          switch (queryParams.requestAction) {
            case 'approve':
              this.approvePendingShareVo(targetRequest);
              break;
            case 'deny':
              this.removeShareVo(targetRequest);
              break;
          }
        }
      }
    }
  }

  onShareMemberClick(shareVo: ShareVO) {
    if (this.shareItem.accessRole !== 'access.role.owner') {
      return this.messageService.showMessage(
        `You do not have permission to edit share access.`,
        'danger'
      );
    }

    const buttons = [ ShareActions.ChangeAccess, ShareActions.Remove ];
    this.promptService.promptButtons(buttons, `Sharing with ${shareVo.ArchiveVO.fullName}`)
      .then((value: 'edit' | 'remove') => {
        switch (value) {
          case 'edit':
            this.editShareVo(shareVo);
            break;
          case 'remove':
            this.removeShareVo(shareVo);
            break;
        }
      });
  }

  onPendingShareClick(shareVo: ShareVO) {
    if (this.shareItem.accessRole !== 'access.role.owner') {
      return this.messageService.showMessage(
        `You do not have permission to approve share requests.`,
        'danger'
      );
    }

    if (shareVo.accessRole === 'access.role.owner') {
      return this.messageService.showMessage(
        `${shareVo.ArchiveVO.fullName} is an Owner on this item and cannot be removed or changed.`,
        'info'
      );
    }

    const buttons = [ ShareActions.Approve, ShareActions.Decline ];
    this.promptService.promptButtons(buttons, `Sharing request from ${shareVo.ArchiveVO.fullName}`)
      .then((value: 'approve' | 'remove') => {
        switch (value) {
          case 'approve':
            this.approvePendingShareVo(shareVo);
            break;
          case 'remove':
            this.removeShareVo(shareVo);
            break;
        }
      });
  }

  async addShareMember() {
    this.loadingRelations = true;
    let isExistingRelation = false;
    try {
      const relations = await this.relationshipService.get();
      this.loadingRelations = false;
      const config: ArchivePickerComponentConfig = {
        shareItem: this.shareItem
      };

      if (relations && relations.length) {
        config.relations = relations.filter((relation) => {
          return !find(this.shareItem.ShareVOs, {archiveId: relation.RelationArchiveVO.archiveId})
            && relation.status === 'status.generic.ok';
        });
      }

      return this.dialog.open('ArchivePickerComponent', config)
        .then((archive: ArchiveVO) => {
          const newShareVo = new ShareVO({
            ArchiveVO: archive,
            accessRole: 'access.role.viewer',
            archiveId: archive.archiveId,
            folder_linkId: this.shareItem.folder_linkId
          });

          isExistingRelation = this.relationshipService.hasRelation(archive);

          return this.editShareVo(newShareVo);
        })
        .then(() => {
          if (isExistingRelation) {
            this.ga.sendEvent(EVENTS.SHARE.ShareByRelationship.initiated.params);
          } else {
            this.ga.sendEvent(EVENTS.SHARE.ShareByAccountNoRel.initiated.params);
          }
        });
    } catch (err) {
      this.loadingRelations = false;
      throw err;
    }
  }


  editShareVo(shareVo: ShareVO) {
    let updatedShareVo: ShareVO;
    const deferred = new Deferred();
    const fields: PromptField[] = [
     ACCESS_ROLE_FIELD_INITIAL(shareVo.accessRole)
    ];

    const newShare = !shareVo.shareId;
    let promptTitle = `Edit ${shareVo.ArchiveVO.fullName} access to ${this.shareItem.displayName}`;
    if (newShare) {
      promptTitle = `Choose ${shareVo.ArchiveVO.fullName} access to ${this.shareItem.displayName}`;
    }

    return this.promptService.prompt(
      fields,
      promptTitle,
      deferred.promise,
      'Share'
      )
      .then((value) => {
        updatedShareVo = new ShareVO(shareVo);
        updatedShareVo.accessRole = value.accessRole;

        return this.api.share.upsert(updatedShareVo);
      })
      .then((response: ShareResponse) => {
        let successMessage = 'Share access saved successfully.';
        if (newShare) {
          successMessage = `${shareVo.ArchiveVO.fullName} added to share successfully.`;
        }
        this.messageService.showMessage(successMessage, 'success');
        if (newShare) {
          if (!this.shareItem.ShareVOs) {
            this.shareItem.ShareVOs = [];
          }
          this.shareItem.ShareVOs.push(new ShareVO(updatedShareVo));
          this.shares.push(updatedShareVo);
        } else {
          shareVo.accessRole = updatedShareVo.accessRole;
        }
        deferred.resolve();
      })
      .catch((response: ShareResponse) => {
        if (response) {
          this.messageService.showError(response.getMessage(), true);
        }
        deferred.resolve();
      });
  }

  removeShareVo(shareVO: ShareVO) {
    const deferred = new Deferred();
    const confirmTitle = `Remove ${shareVO.ArchiveVO.fullName} from this share?`;
    this.promptService.confirm('Remove', confirmTitle, deferred.promise, 'btn-danger')
      .then(() => {
        this.api.share.remove(shareVO)
        .then((response: ShareResponse) => {
          this.messageService.showMessage(`${shareVO.ArchiveVO.fullName} removed successfully.`, 'success');
          remove(this.shareItem.ShareVOs, shareVO);
          remove(this.pendingShares, shareVO);
          remove(this.shares, shareVO);
          deferred.resolve();
        })
        .catch((response: ShareResponse) => {
          deferred.resolve();
          this.messageService.showError(response.getMessage(), true);
        });
      })
      .catch(() => {
        deferred.resolve();
      });
  }

  approvePendingShareVo(shareVO: ShareVO) {
    const deferred = new Deferred();

    shareVO.status = 'status.generic.ok';

    this.api.share.update(shareVO)
    .then((response: ShareResponse) => {
      this.messageService.showMessage(`${shareVO.ArchiveVO.fullName} granted access.`, 'success');
      remove(this.pendingShares, shareVO);
      this.shares.push(shareVO);
      deferred.resolve();
    })
    .catch((response: ShareResponse) => {
      deferred.resolve();
      this.messageService.showError(response.getMessage(), true);
    });
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
        throw err;
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

  close() {
    this.dialogRef.close();
  }

}
