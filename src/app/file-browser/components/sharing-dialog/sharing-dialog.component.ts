import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  NgModel,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { ShareVO, ShareByUrlVO, ItemVO, ArchiveVO, InviteVO } from '@models';
import { AccessRoleType } from '@models/access-role';
import { sortShareVOs } from '@models/share-vo';
import { Deferred } from '@root/vendor/deferred';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ngIfScaleAnimation,
  ngIfScaleAnimationDynamic,
} from '@shared/animations';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { InviteResponse } from '@shared/services/api/index.repo';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  PromptService,
  RELATION_OPTIONS,
  SHARE_ACCESS_ROLE_FIELD,
} from '@shared/services/prompt/prompt.service';
import { getSQLDateTime } from '@shared/utilities/dateTime';
import { copyFromInputElement } from '@shared/utilities/forms';
import { addDays, differenceInHours, isPast } from 'date-fns';
import { find, partition, remove } from 'lodash';
import { faTrash } from '@fortawesome/pro-regular-svg-icons';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { shareUrlBuilder } from '@fileBrowser/utils/utils';

enum Expiration {
  Never = 'Never',
  Day = '1 day',
  Week = '1 week',
  Month = '1 month',
  Year = '1 year',
  Other = 'Other',
}

enum ExpirationDays {
  Day = 1,
  Week = 7,
  Month = 30,
  Year = 365,
}

type ShareByUrlProps =
  | 'defaultAccessRole'
  | 'expiresDT'
  | 'autoApproveToggle'
  | 'previewToggle';

const EXPIRATION_OPTIONS: FormInputSelectOption[] = Object.values(
  Expiration,
).map((x) => {
  return {
    value: x,
    text: x,
  };
});

@Component({
  selector: 'pr-sharing-dialog',
  templateUrl: './sharing-dialog.component.html',
  styleUrls: ['./sharing-dialog.component.scss'],
  animations: [ngIfScaleAnimation, ngIfScaleAnimationDynamic],
})
export class SharingDialogComponent implements OnInit {
  public shareItem: ItemVO = null;
  public shareLinkResponse = null;

  public originalRoles = new Map<number, AccessRoleType>();
  public canShare = false;

  public shares: ShareVO[] = [];
  public pendingShares: ShareVO[] = [];

  public shareLink = '';

  public previewToggle: 0 | 1 = 1;
  public autoApproveToggle: 0 | 1 = 1;
  public expiration: Expiration;
  public linkDefaultAccessRole = 'viewer';

  public updatingLink = false;
  public linkCopied = false;
  public showLinkSettings = false;

  public linkType = 'private';

  public trashIcon = faTrash;

  public newAccessRole: AccessRoleType = 'access.role.viewer';
  public accessRoleOptions: FormInputSelectOption[] =
    SHARE_ACCESS_ROLE_FIELD.selectOptions.reverse();
  public expirationOptions: FormInputSelectOption[] = EXPIRATION_OPTIONS;
  public relationOptions: FormInputSelectOption[] = RELATION_OPTIONS;

  public sendingInvitation = false;
  public showInvitationForm = false;
  public invitationForm: UntypedFormGroup;

  public shareLinkTypes = [
    {
      text: 'Anyone can view',
      value: 'public',
      description: 'Anyone with the link can view and download.',
    },
    {
      text: 'Restricted',
      value: 'private',
      description: 'Must be logged in to view.',
    },
  ];

  public displayDropdown = false;

  @ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;

  public archiveFilterFn = (a: ArchiveVO) => {
    return (
      !find(this.shares, { archiveId: a.archiveId }) &&
      !find(this.shares, { archiveId: a.archiveId })
    );
  };
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private accountService: AccountService,
    private dialogRef: DialogRef,
    private promptService: PromptService,
    private fb: UntypedFormBuilder,
    private api: ApiService,
    private messageService: MessageService,
    private relationshipService: RelationshipService,
    private ga: GoogleAnalyticsService,
    private route: ActivatedRoute,
    private feature: FeatureFlagService,
    private shareLinkService: ShareLinksApiService,
  ) {
    this.invitationForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      relationship: ['relation.friend', [Validators.required]],
      accessRole: ['access.role.viewer', [Validators.required]],
    });

    this.shareItem = this.data.item as ItemVO;
    this.shareLinkResponse = this.data.shareLinkResponse;
    this.displayDropdown = feature.isEnabled('unlisted-share');
  }

  ngOnInit(): void {
    this.shareItem.ShareVOs = sortShareVOs(this.shareItem.ShareVOs);

    if (this.shareItem.ShareVOs && this.shareItem.ShareVOs.length) {
      for (const share of this.shareItem.ShareVOs) {
        this.originalRoles.set(share.shareId, share.accessRole);
      }
      [this.pendingShares, this.shares] = partition(this.shareItem.ShareVOs, {
        status: 'status.generic.pending',
      }) as any;
    }

    this.canShare = this.shareItem.accessRole === 'access.role.owner';

    this.relationshipService.update();

    this.shareLink = shareUrlBuilder(
      this.data.shareLinkResponse.itemType,
      this.data.shareLinkResponse.token,
      this.data.shareLinkResponse.itemId,
    );
    this.setShareLinkFormValue();

    this.checkQueryParams();
  }

  checkQueryParams() {
    if (this.route.snapshot) {
      const params = this.route.snapshot.queryParamMap;
      if (params.has('requestToken') && params.has('requestAction')) {
        const pendingShare = find(this.pendingShares, {
          requestToken: params.get('requestToken'),
        });
        if (pendingShare) {
          const action = params.get('requestAction');
          switch (action) {
            case 'approve':
              this.approveShare(pendingShare);
              break;
            case 'deny':
              this.removeShare(pendingShare);
              break;
          }
        }
      }
    }
  }

  onDoneClick(): void {
    this.shareItem.ShareVOs = [...this.pendingShares, ...this.shares];
    this.dialogRef.close();
  }

  onAddArchive(archive: ArchiveVO) {
    this.createShare(archive, this.newAccessRole);
  }

  onAddInvite(email: string) {
    this.invitationForm.reset();
    this.invitationForm.patchValue({
      email,
      accessRole: this.newAccessRole,
      relationship: 'relation.friend',
    });

    this.showInvitationForm = true;
  }

  async sendInvite(value: any) {
    try {
      this.sendingInvitation = true;
      const invite = new InviteVO({
        email: value.email,
        fullName: value.fullName,
        byArchiveId: this.accountService.getArchive().archiveId,
        relationship: 'relation.family.uncle',
        accessRole: value.accessRole,
      });

      await this.api.invite.sendShareInvite(invite, this.shareItem);
      this.messageService.showMessage({
        message: 'Share invitation sent.',
        style: 'success',
      });
      this.showInvitationForm = false;
    } catch (err) {
      if (err instanceof InviteResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    } finally {
      this.sendingInvitation = false;
    }
  }

  confirmOwnerAdd(share: ShareVO) {
    return this.promptService.confirm(
      'Add owner',
      `Are you sure you share this item with The ${share.ArchiveVO.fullName} Archive as an owner?`,
    );
  }

  confirmRemove(share: ShareVO) {
    return this.promptService.confirm(
      'Remove',
      `Are you sure you want to remove The ${share.ArchiveVO.fullName} Archive?`,
      null,
      'btn-danger',
    );
  }

  confirmDeny(share: ShareVO) {
    return this.promptService.confirm(
      'Deny request',
      `Are you sure you want deny The ${share.ArchiveVO.fullName} Archive access?`,
      null,
      'btn-danger',
    );
  }

  onAccessChange(share: ShareVO) {
    if ((share.accessRole as any) === 'remove') {
      this.removeShare(share);
    } else {
      this.updateShare(share);
    }
  }

  isArchiveSharedWith(archive: ArchiveVO) {
    return (
      find(this.shares, { archiveId: archive.archiveId }) ||
      find(this.pendingShares, { archiveId: archive.archiveId })
    );
  }

  async createShare(archive: ArchiveVO, accessRole: AccessRoleType) {
    if (this.isArchiveSharedWith(archive)) {
      this.messageService.showMessage({
        message: 'This archive has already been shared with',
      });
      return;
    }

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
      this.shares = sortShareVOs(this.shares);
      const response = await this.api.share.upsert(share);
      share.isNewlyCreated = false;
      share.shareId = response.getShareVO().shareId;
      this.originalRoles.set(share.shareId, share.accessRole);
    } catch (err) {
      remove(this.shares, share);
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    }
  }

  async updateShare(share: ShareVO) {
    share.isPendingAction = true;
    try {
      if (share.accessRole === 'access.role.owner') {
        await this.confirmOwnerAdd(share);
      }
      this.shares = sortShareVOs(this.shares);
      await this.api.share.upsert(share);
      this.originalRoles.set(share.shareId, share.accessRole);
    } catch (err) {
      share.accessRole = this.originalRoles.get(share.shareId);
      this.shares = sortShareVOs(this.shares);
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    } finally {
      share.isPendingAction = false;
    }
  }

  async approveShare(share: ShareVO) {
    share.isPendingAction = true;
    share.status = 'status.generic.ok';
    remove(this.pendingShares, share);
    this.shares.push(share);
    this.shares = sortShareVOs(this.shares);
    try {
      await this.api.share.upsert(share);
      this.messageService.showMessage({
        message: `Share request approved for The ${share.ArchiveVO.fullName} Archive.`,
        style: 'success',
      });
    } catch (err) {
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
      remove(this.shares, share);
      this.pendingShares.push(share);
      this.pendingShares = sortShareVOs(this.pendingShares);
    } finally {
      share.isPendingAction = false;
    }
  }

  async removeShare(share: ShareVO) {
    const isPending = share.status?.includes('pending');

    if (isPending) {
      try {
        await this.confirmDeny(share);
      } catch (err) {
        return;
      }
    } else {
      try {
        await this.confirmRemove(share);
      } catch (err) {
        share.accessRole = this.originalRoles.get(share.shareId);
        return;
      }
    }

    try {
      share.isPendingAction = true;
      await this.api.share.remove(share);
      remove(this.shares, share);
      remove(this.pendingShares, share);
      this.shares = sortShareVOs(this.shares);
    } catch (err) {
      share.isPendingAction = false;
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    }
  }

  getExpirationFromExpiresDT(expiresDT: string): Expiration {
    if (!expiresDT) {
      return Expiration.Never;
    }

    const diff = differenceInHours(
      new Date(expiresDT),
      new Date(this.shareLinkResponse.createdDT),
    );

    if (diff <= 24 * ExpirationDays.Day) {
      return Expiration.Day;
    } else if (diff <= 24 * ExpirationDays.Week) {
      return Expiration.Week;
    } else if (diff <= 24 * 7 * ExpirationDays.Month) {
      return Expiration.Month;
    } else if (diff <= 24 * 7 * ExpirationDays.Year) {
      return Expiration.Year;
    } else {
      return Expiration.Other;
    }
  }

  getExpiresDTFromExpiration(expiration: Expiration): string {
    switch (expiration) {
      case Expiration.Never:
        return null;
      case Expiration.Day:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdDT), 1),
        );
      case Expiration.Week:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdDT), 7),
        );
      case Expiration.Month:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdDT), 30),
        );
      case Expiration.Year:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdDT), 365),
        );
    }
  }

  setShareLinkFormValue(): void {
    if (this.shareLinkResponse) {
      console.log(this.shareLinkResponse);
      this.previewToggle = this.shareLinkResponse.previewToggle;
      this.autoApproveToggle = this.shareLinkResponse.autoApproveToggle || 0;
      this.expiration = this.getExpirationFromExpiresDT(
        this.shareLinkResponse.expiresDT,
      );
      console.log(this.shareLinkResponse);
      console.log(this.shareLinkResponse.permissionsLevel);
      this.linkDefaultAccessRole = this.shareLinkResponse.permissionLevel;
      this.expirationOptions = EXPIRATION_OPTIONS.filter((expiration) => {
        switch (expiration.value) {
          case Expiration.Never:
          case Expiration.Other:
            return true;
          default:
            return !isPast(
              new Date(
                this.getExpiresDTFromExpiration(expiration.value as Expiration),
              ),
            );
        }
      });
    } else {
      this.previewToggle = 1;
      this.autoApproveToggle = 1;
      this.expiration = Expiration.Never;
      this.expirationOptions = EXPIRATION_OPTIONS;
    }
  }

  async generateShareLink() {
    this.updatingLink = true;
    try {
      const response = await this.api.share.generateShareLink(this.shareItem);
      this.shareLinkResponse = response;
      this.shareLinkResponse.autoApproveToggle = this.autoApproveToggle || 0;
      this.shareLinkResponse.previewToggle = this.previewToggle || 0;
      await this.api.share.updateShareLink(this.shareLinkResponse);
      this.setShareLinkFormValue();
      this.showLinkSettings = true;
      this.ga.sendEvent(EVENTS.SHARE.ShareByUrl.initiated.params);
    } catch (err) {
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    } finally {
      this.updatingLink = false;
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
        'btn-danger',
      );

      await this.api.share.removeShareLink(this.shareLinkResponse);
      this.shareLink = null;
      this.setShareLinkFormValue();
      deferred.resolve();
      this.showLinkSettings = false;
    } catch (response) {
      deferred.resolve();
      if (response instanceof ShareResponse) {
        this.messageService.showError({ message: response.getMessage() });
      }
    }
  }

  async onShareLinkPropChange(propName: ShareByUrlProps, value: any) {
    this.updatingLink = true;
    try {
      const update = new ShareByUrlVO(this.shareLink);
      update[propName] = value;
      await this.api.share.updateShareLink(update);
      this.shareLink[propName] = update[propName];
    } catch (err) {
      if (err instanceof ShareResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
      this.setShareLinkFormValue();
    } finally {
      this.updatingLink = false;
    }
  }
}
