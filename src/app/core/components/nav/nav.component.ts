import {
	Component,
	AfterViewInit,
	ViewChild,
	Optional,
	OnDestroy,
} from '@angular/core';
import { SidebarActionPortalService } from '@core/services/sidebar-action-portal/sidebar-action-portal.service';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { NotificationService } from '@root/app/notifications/services/notification.service';
import { EventService } from '@shared/services/event/event.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { NotificationDialogComponent } from '@root/app/notifications/components/notification-dialog/notification-dialog.component';
import { Overlay } from '@angular/cdk/overlay';

@Component({
	selector: 'pr-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss'],
	standalone: false,
})
export class NavComponent implements AfterViewInit, OnDestroy {
	hambugerMenuVisible: boolean;
	rightMenuVisible: boolean;

	@ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

	constructor(
		private event: EventService,
		private overlay: Overlay,
		@Optional() private portalService: SidebarActionPortalService,
		@Optional() public notificationService: NotificationService,
		@Optional() private dialog: DialogCdkService,
	) {}

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
			this.dialog.open(NotificationDialogComponent, {
				height: 'fullscreen',
				panelClass: 'notification-dialog',
				positionStrategy: this.overlay.position().global().right('0'),
			});
		} catch (err) {}
	}
}
