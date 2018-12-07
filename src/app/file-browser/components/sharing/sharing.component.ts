import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef, Dialog } from '@root/app/dialog/dialog.service';
import { RecordVO, FolderVO, ShareVO } from '@models/index';
import { PromptButton, PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { Validators } from '@angular/forms';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';
import { remove } from 'lodash';

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
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private promptService: PromptService,
    private prConstants: PrConstantsService,
    private api: ApiService,
    private messageService: MessageService
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

    return this.promptService.prompt(
      fields,
      `Edit ${shareVo.ArchiveVO.fullName} access to ${this.shareItem.displayName}`,
      deferred.promise,
      'Save'
      )
      .then((value) => {
        updatedShareVo = new ShareVO(shareVo);
        updatedShareVo.accessRole = value.accessRole;

        return this.api.share.update(updatedShareVo);
      })
      .then((response: ShareResponse) => {
        this.messageService.showMessage('Share access saved successfully.', 'success');
        shareVo.accessRole = updatedShareVo.accessRole;
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
    this.promptService.confirm('Remove', confirmTitle, deferred.promise)
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
