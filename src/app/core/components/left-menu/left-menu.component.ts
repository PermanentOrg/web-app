import { Component, OnInit, Input, Output, EventEmitter, HostBinding, OnChanges, SimpleChanges, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO } from '@root/app/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pr-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public archiveName: string;
  public archive: ArchiveVO;

  @ViewChild('scroll') scrollElementRef: ElementRef;

  private subscriptions: Subscription[] = [];
  private currentUrl: string;
  private urlMatches: Map<string, boolean> = new Map();

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    if (this.accountService.getArchive()) {
      this.archive = this.accountService.getArchive();
    }

    this.accountService.archiveChange.subscribe((archive: ArchiveVO) => {
      this.archive = archive;
    });

    this.subscriptions.push(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url;
          this.urlMatches.clear();
        }
      })
    );
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isVisible.currentValue && !changes.isVisible.previousValue) {
      this.resetScroll();
    }
  }

  resetScroll() {
    if (this.scrollElementRef) {
      (this.scrollElementRef.nativeElement as HTMLElement).scrollTo(0, 0);
    }
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);

    if (!(event.target as HTMLElement).getAttribute('href')) {
      event.stopPropagation();
      return false;
    }
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }

  checkMenuItemActive(urlSegment: string) {
    if (!this.urlMatches.has(urlSegment)) {
      this.urlMatches.set(urlSegment, this.currentUrl.includes(urlSegment));
    }

    return this.urlMatches.get(urlSegment);
  }

}
