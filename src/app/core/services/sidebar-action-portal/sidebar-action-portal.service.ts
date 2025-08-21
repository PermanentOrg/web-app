import { Injectable } from '@angular/core';
import { PortalOutlet, CdkPortal } from '@angular/cdk/portal';

@Injectable()
export class SidebarActionPortalService {
	private outlet: PortalOutlet;
	private currentPortal: CdkPortal;

	provideOutlet(portalOutlet: PortalOutlet) {
		this.outlet = portalOutlet;

		if (this.currentPortal) {
			this.outlet.attach(this.currentPortal);
		}
	}

	providePortal(portal: CdkPortal) {
		this.currentPortal = portal;

		if (this.outlet) {
			this.outlet.attach(portal);
		}
	}

	dispose(portalOutlet: PortalOutlet) {
		if (!this.outlet) {
			throw new Error(
				"SidebarActionPortalService - no outlet, can't dispose of outlet!",
			);
		}

		if (this.outlet !== portalOutlet) {
			throw new Error(
				"SidebarActionPortalService - outlet mismatch, can't dispose!",
			);
		}

		portalOutlet.dispose();
		this.outlet = null;
	}

	detachPortal(portal: CdkPortal) {
		if (!this.outlet) {
			throw new Error(
				"SidebarActionPortalService - no outlet, can't detach portal!",
			);
		}

		if (this.currentPortal !== portal) {
			throw new Error(
				"SidebarActionPortalService - portal mismatch, can't detach!",
			);
		}

		this.outlet.detach();
		this.currentPortal = null;
	}
}
