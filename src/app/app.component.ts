/* @format */
import { Component, OnInit, HostBinding } from '@angular/core';

declare var iosInnerHeight: Function;

@Component({
  selector: 'pr-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @HostBinding('class.mobile-safari') isMobileSafari = false;
  @HostBinding('class.mobile-safari-menu-bar-showing') isMenuBarShowing = false;

  constructor(
  ) {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const iPhone =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
    this.isMobileSafari = isSafari && iPhone;
    this.isMenuBarShowing = window.innerHeight !== iosInnerHeight();

    if (this.isMobileSafari) {
      window.addEventListener('resize', (ev) => {
        this.isMenuBarShowing = window.innerHeight !== iosInnerHeight();
      });
    }
  }

  ngOnInit() {}
}
