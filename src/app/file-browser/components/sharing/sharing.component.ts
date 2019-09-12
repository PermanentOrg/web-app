import { Component, OnInit, Inject } from '@angular/core';

import { remove, find, partition } from 'lodash';
import { Deferred } from '@root/vendor/deferred';

import { PromptButton, PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { RelationshipService } from '@core/services/relationship/relationship.service';

import { RecordVO, FolderVO, ShareVO, ArchiveVO, ShareByUrlVO } from '@models/index';
import { ArchivePickerComponentConfig } from '@shared/components/archive-picker/archive-picker.component';
import { ACCESS_ROLE_FIELD, ACCESS_ROLE_FIELD_INITIAL } from '@core/components/prompt/prompt-fields';

const ShareActions: {[key: string]: PromptButton} = {
  ChangeAccess: {
    buttonName: 'edit',
    buttonText: 'Edit Access'
  },
  Remove: {
    buttonName: 'remove',
    buttonText: 'Remove',
    class: 'btn-danger'
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

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private dialog: Dialog,
    private promptService: PromptService,
    private prConstants: PrConstantsService,
    private api: ApiService,
    private messageService: MessageService,
    private relationshipService: RelationshipService
  ) {
    this.shareItem = this.data.item as FolderVO | RecordVO;
    this.shareLink = this.data.link;

    if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
      [ this.pendingShares, this.shares ] = partition(this.shareItem.ShareVOs, {status: 'status.generic.pending'}) as any;
    }
  }

  ngOnInit() {
  }

  onShareMemberClick(shareVo: ShareVO) {
    if (this.shareItem.accessRole !== 'access.role.owner') {
      return this.messageService.showMessage(
        `You do not have permission to edit share access.`,
        'danger'
      );
    }

    if (shareVo.accessRole === 'access.role.owner') {
      return this.messageService.showMessage(
        `${shareVo.ArchiveVO.fullName} is an Owner on this item and cannot be removed or changed.`,
        'info'
      );
    }

    const buttons = [ ShareActions.ChangeAccess, ShareActions.Remove ];
    this.promptService.promptButtons(buttons, `Sharing with ${shareVo.ArchiveVO.fullName}`)
      .then((value: string) => {
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
        `You do not have permission to edit share access.`,
        'danger'
      );
    }

    if (shareVo.accessRole === 'access.role.owner') {
      return this.messageService.showMessage(
        `${shareVo.ArchiveVO.fullName} is an Owner on this item and cannot be removed or changed.`,
        'info'
      );
    }

    const buttons = [ ShareActions.ChangeAccess, ShareActions.Remove ];
    this.promptService.promptButtons(buttons, `Sharing with ${shareVo.ArchiveVO.fullName}`)
      .then((value: string) => {
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

  addShareMember() {
    this.loadingRelations = true;
    return this.relationshipService.get()
      .catch(() => {
        this.loadingRelations = false;
      })
      .then((relations) => {
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

        return this.dialog.open('ArchivePickerComponent', config);
      })
      .then((archive: ArchiveVO) => {
        const newShareVo = new ShareVO({
          ArchiveVO: archive,
          accessRole: 'access.role.viewer',
          archiveId: archive.archiveId,
          folder_linkId: this.shareItem.folder_linkId
        });
        return this.editShareVo(newShareVo);
      })
      .catch(() => {
      });


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

  async generateShareLink() {
    const response = await this.api.share.generateShareLink(this.shareItem);

    if (response.isSuccessful) {
      console.log(response.getShareByUrlVO());
      this.shareLink = response.getShareByUrlVO();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
