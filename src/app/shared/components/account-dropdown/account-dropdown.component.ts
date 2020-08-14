import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO, ArchiveVO } from '@models';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { MessageService } from '@shared/services/message/message.service';
import { Router, NavigationStart } from '@angular/router';
import { ngIfFadeInAnimationSlow, TWEAKED } from '@shared/animations';
import { trigger, transition, style, animate, group, query, animateChild } from '@angular/animations';
import { Dialog } from '@root/app/dialog/dialog.module';
import { SettingsTab } from '@core/components/settings-dialog/settings-dialog.component';

const dropdownMenuAnimation = trigger('dropdownMenuAnimation', [
  transition(
    ':enter',
    group([
      query('@ngIfFadeInAnimationSlow', [
        animateChild()
      ]),
      style({ height: '0px' }),
      animate(`250ms ${TWEAKED}`, style({ height: '*' })),
    ])
  ),
  transition(
    ':leave',
    [
      style({ height: '*', opacity: 0 }),
      animate(`250ms ${TWEAKED}`, style({ height: '0px' })),
    ]
  )
]);

@Component({
  selector: 'pr-account-dropdown',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['./account-dropdown.component.scss'],
  animations: [ dropdownMenuAnimation, ngIfFadeInAnimationSlow ]
})
export class AccountDropdownComponent implements OnInit, OnDestroy, HasSubscriptions {
  public account: AccountVO;
  public archive: ArchiveVO;

  public subscriptions: Subscription[] = [];

  public showMenu = false;

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private element: ElementRef,
    private dialog: Dialog
  ) { }

  ngOnInit() {
    this.account = this.accountService.getAccount();
    this.archive = this.accountService.getArchive();
    this.subscriptions.push(
      this.accountService.accountChange.subscribe(account => {
        this.account = account;
      })
    );
    this.subscriptions.push(
      this.accountService.archiveChange.subscribe(archive => {
        this.archive = archive;
      })
    );
    this.subscriptions.push(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.showMenu = false;
        }
      })
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
    const outsideClick = !(this.element.nativeElement as HTMLElement).contains(event.target as Node);
    if (this.showMenu && outsideClick) {
      this.showMenu = false;
    }
  }

  openSettingsDialog(activeTab: SettingsTab) {
    this.showMenu = false;
    try {
      this.dialog.open('SettingsDialogComponent', { tab: activeTab }, { width: '1000px' });
    } catch (err) {

    }
  }

  openInvitationsDialog() {
    this.showMenu = false;
    try {
      this.dialog.open('InvitationsDialogComponent', {}, { width: '1000px' });
    } catch (err) {

    }
  }

}
