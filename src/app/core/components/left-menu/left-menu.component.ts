import { Component, OnInit, Input, Output, EventEmitter, HostBinding, OnChanges, SimpleChanges, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO, AccountVO } from '@root/app/models';
import { Subscription } from 'rxjs';
import { ngIfSlideInAnimation, ngIfScaleHeightAnimation } from '@shared/animations';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { Dialog } from '@root/app/dialog/dialog.module';
import { ApiService } from '@shared/services/api/api.service';
import { ProfileService } from '@shared/services/profile/profile.service';

@Component({
  selector: 'pr-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  animations: [ ngIfSlideInAnimation, ngIfScaleHeightAnimation ]
})
export class LeftMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public showArchiveSelector: false;
  public archiveName: string;
  public archive: ArchiveVO;

  public showArchiveOptions = false;

  @ViewChild('scroll') scrollElementRef: ElementRef;

  private subscriptions: Subscription[] = [];
  private currentUrl: string;
  private urlMatches: Map<string, boolean> = new Map();

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private messageService: MessageService,
    private router: Router,
    private relationshipService: RelationshipService,
    private dialog: Dialog,
    private profile: ProfileService,
    private elementRef: ElementRef
  ) {
    if (this.accountService.getArchive()) {
      this.archive = this.accountService.getArchive();
    }

    this.subscriptions.push(
      this.accountService.archiveChange.subscribe((archive: ArchiveVO) => {
        this.archive = archive;
        this.checkArchiveThumbnail();
      })
    );

    this.subscriptions.push(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.showArchiveOptions = false;
        } else if (event instanceof NavigationEnd) {
          this.currentUrl = this.router.url;
          this.urlMatches.clear();
        }
      })
    );
  }

  ngOnInit() {
    this.checkArchiveThumbnail();
  }

  checkArchiveThumbnail() {
    if (!this.archive.thumbURL500) {
      setTimeout(async () => {
        await this.accountService.refreshArchive();
        this.checkArchiveThumbnail();
      }, 5000);
    }
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
      this.urlMatches.set(urlSegment, this.currentUrl?.replace(/[()]/g, '').includes(urlSegment));
    }

    return this.urlMatches.get(urlSegment);
  }

  async onConnectionsClick() {
    const connections = await this.relationshipService.get();
    this.dialog.open('ConnectionsDialogComponent', { connections }, { width: '1000px'});
    this.showArchiveOptions = false;
  }

  async onProfileClick() {
    await this.profile.fetchProfileItems();
    this.dialog.open('ProfileEditComponent', null, { width: '100%', height: 'fullscreen', menuClass: 'profile-editor-dialog'});
    this.showArchiveOptions = false;
  }

  async onAllArchivesClick() {
    await this.accountService.refreshArchives();
    this.dialog.open('MyArchivesDialogComponent', null, { width: '1000px'});
    this.showArchiveOptions = false;
  }

  async onMembersClick() {
    const currentAccount = this.accountService.getAccount();
    const response = await this.api.archive.getMembers(this.accountService.getArchive());
    const members = response.getAccountVOs();
    members.forEach((member: AccountVO) => {
      if (member.accountId === currentAccount.accountId) {
        member.isCurrent = true;
      }
    });
    this.dialog.open('MembersDialogComponent', { members }, { width: '800px'});
    this.showArchiveOptions = false;
  }


}
