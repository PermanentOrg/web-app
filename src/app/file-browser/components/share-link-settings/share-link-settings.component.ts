import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { shareUrlBuilder } from '@fileBrowser/utils/utils';
import { ItemVO, RecordVO, ShareByUrlVO } from '@models/index';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { Deferred } from '@root/vendor/deferred';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { ShareResponse } from '@shared/services/api/share.repo';
import { EVENTS } from '@shared/services/google-analytics/events';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { getSQLDateTime } from '@shared/utilities/dateTime';
import { copyFromInputElement } from '@shared/utilities/forms';
import { addDays, differenceInHours, isPast } from 'date-fns';
import { faTrash } from '@fortawesome/pro-regular-svg-icons';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { ngIfScaleAnimation } from '@shared/animations';
import { ShareLink } from '@root/app/share-links/models/share-link';

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
  | 'expirationTimestamp'
  | 'autoApproveToggle'
  | 'accessRestrictions'
  | 'permissionsLevel';

const EXPIRATION_OPTIONS: FormInputSelectOption[] = Object.values(
  Expiration,
).map((x) => {
  return {
    value: x,
    text: x,
  };
});

const accessRoles = [
  {
    text: 'Owner',
    value: 'owner',
  },
  {
    text: 'Manager',
    value: 'manager',
  },
  {
    text: 'Contributor',
    value: 'contributor',
  },
  {
    text: 'Editor',
    value: 'editor',
  },

  {
    text: 'Viewer',
    value: 'viewer',
  },
];

@Component({
  selector: 'pr-share-link-settings',
  templateUrl: './share-link-settings.component.html',
  styleUrl: './share-link-settings.component.scss',
  animations: [ngIfScaleAnimation],
})
export class ShareLinkSettingsComponent implements OnInit {
  @Input() shareLink: string = '';
  @Input() shareItem: ItemVO = null;
  @Input() shareLinkResponse: Partial<ShareLink> = null;
  @Input() canShare: boolean = false;
  @ViewChild('shareUrlInput', { static: false }) shareUrlInput: ElementRef;

  public displayDropdown: boolean = false;
  public showLinkSettings: boolean = false;
  public autoApproveToggle: 0 | 1 = 1;
  public expiration: Expiration;
  public linkDefaultAccessRole = 'viewer';
  public expirationOptions: FormInputSelectOption[] = EXPIRATION_OPTIONS;
  public updatingLink: boolean = false;
  public linkCopied: boolean = false;
  public accessRestrictions: string = 'account';
  public trashIcon = faTrash;
  public shareLinkAccessRoles: FormInputSelectOption[] = accessRoles;

  public shareLinkTypes = [
    {
      text: 'Anyone can view',
      value: 'none',
      description: 'Anyone with the link can view and download.',
    },
    {
      text: 'Restricted',
      value: 'account',
      description: 'Must be logged in to view.',
    },
  ];

  constructor(
    private feature: FeatureFlagService,
    private ga: GoogleAnalyticsService,
    private messageService: MessageService,
    private promptService: PromptService,
    private shareLinkApiService: ShareLinksApiService,
  ) {
    this.displayDropdown = feature.isEnabled('unlisted-share');
  }

  ngOnInit(): void {
    this.shareLink = shareUrlBuilder(
      this.shareLinkResponse?.itemType,
      this.shareLinkResponse?.token,
      this.shareLinkResponse?.itemId,
    );
    this.setShareLinkFormValue();
  }

  getExpirationFromExpiresDT(expiresDT: string): Expiration {
    if (!expiresDT) {
      return Expiration.Never;
    }

    const diff = differenceInHours(
      new Date(expiresDT),
      new Date(this.shareLinkResponse.createdAt),
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
          addDays(new Date(this.shareLinkResponse.createdAt), 1),
        );
      case Expiration.Week:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdAt), 7),
        );
      case Expiration.Month:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdAt), 30),
        );
      case Expiration.Year:
        return getSQLDateTime(
          addDays(new Date(this.shareLinkResponse.createdAt), 365),
        );
    }
  }

  setShareLinkFormValue(): void {
    if (this.shareLinkResponse) {
      this.accessRestrictions = this.shareLinkResponse.accessRestrictions;
      this.autoApproveToggle = 0;
      this.expiration = this.getExpirationFromExpiresDT(
        this.shareLinkResponse?.expirationTimestamp,
      );
      this.linkDefaultAccessRole = this.shareLinkResponse.permissionsLevel;
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
      this.autoApproveToggle = 1;
      this.expiration = Expiration.Never;
      this.expirationOptions = EXPIRATION_OPTIONS;
    }
  }

  async generateShareLink() {
    this.updatingLink = true;
    try {
      const itemId =
        this.shareItem instanceof RecordVO
          ? this.shareItem.recordId
          : this.shareItem.folderId;

      const itemType = this.shareItem instanceof RecordVO ? 'record' : 'folder';

      const response = await this.shareLinkApiService.generateShareLink({
        itemId,
        itemType,
      });
      const responseId = response.id;
      const cleaned = this.getCleanedResponse(response);
      this.shareLinkResponse = cleaned;
      this.accessRestrictions = 'none';
      const updateResponse = await this.shareLinkApiService.updateShareLink(
        responseId,
        this.shareLinkResponse,
      );
      this.shareLink = shareUrlBuilder(
        updateResponse.itemType,
        updateResponse.token,
        updateResponse.itemId,
      );
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

      await this.shareLinkApiService.deleteShareLink(this.shareLinkResponse.id);
      this.shareLink = '';
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

  async onShareLinkPropChange<K extends keyof ShareLink>(
    propName: K,
    value: ShareLink[K],
  ) {
    this.updatingLink = true;
    try {
      const update: Partial<ShareLink> = {};
      update[propName] = value;

      if (propName === 'accessRestrictions' && value === 'none') {
        update.permissionsLevel = 'viewer';
      }

      if (propName === 'autoApproveToggle') {
        if (value) {
          update.accessRestrictions = 'account';
        } else {
          update.accessRestrictions = 'approval';
        }
      }

      delete update.autoApproveToggle;
      await this.shareLinkApiService.updateShareLink(
        this.shareLinkResponse.id,
        update,
      );
      this.shareLinkResponse[propName] = update[propName];
      (this as any)[propName] = value;
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

  private getCleanedResponse(response: ShareLink): Partial<ShareLink> {
    const keysToRemove = new Set([
      'id',
      'itemId',
      'itemType',
      'token',
      'usesExpended',
      'createdAt',
      'updatedAt',
    ]);

    return Object.fromEntries(
      Object.entries(response).filter(([key]) => !keysToRemove.has(key)),
    );
  }
}
