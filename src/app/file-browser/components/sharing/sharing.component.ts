import { Component, OnInit, Inject } from '@angular/core';
import { Validators } from '@angular/forms';

import { remove, find } from 'lodash';
import { Deferred } from '@root/vendor/deferred';

import { PromptButton, PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { RelationshipService } from '@core/services/relationship/relationship.service';

import { RecordVO, FolderVO, ShareVO, ArchiveVO } from '@models/index';

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

  addShareMember() {
    this.loadingRelations = true;
    return this.relationshipService.get()
      .catch(() => {
        this.loadingRelations = false;
      })
      .then((relations) => {
        this.loadingRelations = false;
        if (!relations || !relations.length) {
          console.log('no relations');
          relations = null;
        } else {
          relations = relations.filter((relation) => {
            return !find(this.shareItem.ShareVOs, {archiveId: relation.RelationArchiveVO.archiveId});
          });
        }
        return this.dialog.open('ArchivePickerComponent', { relations: relations });
      })
      .catch(() => {
        console.log('CANCELLED');
      })
      .then((archive: ArchiveVO) => {
        const newShareVo = new ShareVO({
          ArchiveVO: archive,
          accessRole: 'access.role.viewer',
          archiveId: archive.archiveId,
          folder_linkId: this.shareItem.folder_linkId
        });
        return this.editShareVo(newShareVo);
      });


  }


  editShareVo(shareVo: ShareVO) {
    let updatedShareVo: ShareVO;
    const deferred = new Deferred();
    const fields: PromptField[] = [
      {
        fieldName: 'accessRole',
        placeholder: 'Access Level',
        type: 'select',
        initialValue: shareVo.accessRole,
        validators: [Validators.required],
        config: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off'
        },
        selectOptions: this.prConstants.getAccessRoles().map((role) => {
          return {
            value: role.type,
            text: role.name
          };
        })
      }
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
      'Save'
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
        deferred.reject();
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

  close() {
    this.dialogRef.close();
  }

}
