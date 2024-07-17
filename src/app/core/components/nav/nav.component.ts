/* @format */
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Optional,
  OnDestroy,
} from '@angular/core';
import { SidebarActionPortalService } from '@core/services/sidebar-action-portal/sidebar-action-portal.service';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { NotificationService } from '@root/app/notifications/services/notification.service';
import { Dialog } from '@root/app/dialog/dialog.module';
import { DeviceService } from '@shared/services/device/device.service';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';

@Component({
  selector: 'pr-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, AfterViewInit, OnDestroy {
  hambugerMenuVisible: boolean;
  rightMenuVisible: boolean;

  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

  constructor(
    private event: EventService,
    @Optional() private portalService: SidebarActionPortalService,
    @Optional() public notificationService: NotificationService,
    @Optional() private dialog: Dialog,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.portalService) {
      this.portalService.provideOutlet(this.portalOutlet);
    }
  }

  ngOnDestroy() {
    if (this.portalService) {
      this.portalService.dispose(this.portalOutlet);
    }
  }

  showHamburgerMenu() {
    this.event.dispatch({
      action: 'open_archive_menu',
      entity: 'account',
    });
    this.hambugerMenuVisible = true;
  }

  hideHamburgerMenu() {
    this.hambugerMenuVisible = false;
  }

  showRightMenu() {
    this.rightMenuVisible = true;
  }

  hideRightMenu() {
    this.rightMenuVisible = false;
  }

  showNotificationMenu() {
    try {
      this.dialog.open('NotificationDialogComponent', null, {
        height: 'fullscreen',
        menuClass: 'notification-dialog',
      });
    } catch (err) {}
  }
}
