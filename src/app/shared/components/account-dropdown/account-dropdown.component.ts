/* @format */
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO, ArchiveVO } from '@models';
import {
  HasSubscriptions,
  unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { MessageService } from '@shared/services/message/message.service';
import { Router, NavigationStart } from '@angular/router';
import { ngIfFadeInAnimationSlow, TWEAKED } from '@shared/animations';
import {
  trigger,
  transition,
  style,
  animate,
  group,
  query,
  animateChild,
} from '@angular/animations';
import { Dialog } from '@root/app/dialog/dialog.module';
import { SettingsTab } from '@core/components/account-settings-dialog/account-settings-dialog.component';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import { GuidedTourEvent } from '@shared/services/guided-tour/events';
import { ApiService } from '@shared/services/api/api.service';
import { DeviceService } from '@shared/services/device/device.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';

const dropdownMenuAnimation = trigger('dropdownMenuAnimation', [
  transition(
    ':enter',
    group([
      query('@ngIfFadeInAnimationSlow', [animateChild()]),
      style({ height: '0px' }),
      animate(`250ms ${TWEAKED}`, style({ height: '*' })),
    ]),
  ),
  transition(':leave', [
    style({ height: '*', opacity: 0 }),
    animate(`250ms ${TWEAKED}`, style({ height: '0px' })),
  ]),
]);

@Component({
  selector: 'pr-account-dropdown',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['./account-dropdown.component.scss'],
  animations: [dropdownMenuAnimation, ngIfFadeInAnimationSlow],
})
export class AccountDropdownComponent
  implements OnInit, OnDestroy, HasSubscriptions
{
  public account: AccountVO;
  public archive: ArchiveVO;

  public subscriptions: Subscription[] = [];

  public showMenu = false;

  public showAccountBadge = true;
  public badgeIcon = 'report_problem';
  public badgeTooltip = 'Your account information needs to be verified';

  constructor(
    public accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private element: ElementRef,
    private dialog: Dialog,
    private guidedTour: GuidedTourService,
    private api: ApiService,
    private deviceService: DeviceService,
    private analytics: AnalyticsService,
  ) {}

  ngOnInit() {
    this.account = this.accountService.getAccount();
    this.archive = this.accountService.getArchive();
    this.subscriptions.push(
      this.accountService.accountChange.subscribe((account) => {
        this.account = account;
      }),
    );
    this.subscriptions.push(
      this.accountService.archiveChange.subscribe((archive) => {
        this.archive = archive;
      }),
    );
    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.showMenu = false;
        }
      }),
    );
    this.subscriptions.push(
      this.guidedTour.events$().subscribe((event) => {
        if (event === GuidedTourEvent.RequestAccountDropdownOpen) {
          this.showMenu = true;
        }
      }),
    );
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
  }

  async onLogoutClick() {
    await this.accountService.logOut();
    window.location.assign('/');
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: PointerEvent) {
    // check if it's an element without the dropdown as a parent
    const outsideClick = !(this.element.nativeElement as HTMLElement).contains(
      event.target as Node,
    );

    // check if it's an element used by GuidedTourService and Shepherd.js to display a step, i
    const tourBackdropClick = (event.target as HTMLElement).closest(
      '.shepherd-modal-overlay-container',
    );
    const tourPopupClick = (event.target as HTMLElement).closest(
      '.shepherd-element',
    );
    if (
      this.showMenu &&
      outsideClick &&
      !tourBackdropClick &&
      !tourPopupClick
    ) {
      this.showMenu = false;
    }
  }

  openSettingsDialog(activeTab: SettingsTab) {
    this.showMenu = false;
    try {
      this.dialog.open(
        'SettingsDialogComponent',
        { tab: activeTab },
        { width: '1000px' },
      );
    } catch (err) {}
  }

  openInvitationsDialog() {
    this.showMenu = false;
    try {
      this.dialog.open('InvitationsDialogComponent', {}, { width: '1000px' });
    } catch (err) {}
  }

  async openArchivesDialog() {
    await this.accountService.refreshArchives();
    this.dialog.open('MyArchivesDialogComponent', null, { width: '1000px' });
  }

  handleOpenAccountMenu() {
    this.showMenu = !this.showMenu;
    if (this.showMenu) {
      const screen = this.deviceService.getViewMessageForEventTracking();
      this.analytics.notifyObservers({
        action: 'open_account_menu',
        entity: 'account',
        version: 1,
        entityId: this.account.accountId.toString(),
        body: {
          analytics: {
            event: screen,
            data: { page: 'Account Menu' },
          },
        },
      });
    }
  }
}
