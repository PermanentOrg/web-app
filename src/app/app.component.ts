import { Component, OnInit, HostBinding } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

declare var iosInnerHeight: Function;

@Component({
  selector: 'pr-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @HostBinding('class.mobile-safari') isMobileSafari = false;
  @HostBinding('class.mobile-safari-menu-bar-showing') isMenuBarShowing = false;

  constructor(private api: ApiService, private account: AccountService, private message: MessageService) {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const iPhone = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
    this.isMobileSafari = isSafari && iPhone;
    this.isMenuBarShowing = window.innerHeight !== iosInnerHeight();

    if (this.isMobileSafari) {
      window.addEventListener('resize', (ev) => {
        this.isMenuBarShowing = window.innerHeight !== iosInnerHeight();
      });
    }

  }

  ngOnInit() {
  }
}
