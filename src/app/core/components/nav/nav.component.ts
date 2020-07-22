import { Component, OnInit, HostBinding, AfterViewInit, ViewChild } from '@angular/core';
import { SidebarActionPortalService } from '@core/services/sidebar-action-portal/sidebar-action-portal.service';
import { PortalOutlet, CdkPortalOutlet } from '@angular/cdk/portal';

@Component({
  selector: 'pr-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, AfterViewInit {
  hambugerMenuVisible: boolean;
  rightMenuVisible: boolean;

  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;

  constructor(
    private portalService: SidebarActionPortalService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.portalService.provideOutlet(this.portalOutlet);
  }

  showHamburgerMenu() {
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

}
