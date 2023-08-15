import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { find } from 'lodash';
import * as Sentry from '@sentry/browser';
import debug from 'debug';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  ArchiveVO,
  AccountVO,
  FolderVO,
  ConnectorOverviewVO,
} from '@root/app/models';
import { Subscription } from 'rxjs';
import {
  ngIfSlideInAnimation,
  ngIfScaleHeightAnimation,
} from '@shared/animations';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { Dialog } from '@root/app/dialog/dialog.module';
import { ApiService } from '@shared/services/api/api.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { PayerService } from '@shared/services/payer/payer.service';

@Component({
  selector: 'pr-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  animations: [ngIfSlideInAnimation, ngIfScaleHeightAnimation],
})
export class LeftMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Output() isVisibleChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  @ViewChild('scroll') scrollElementRef: ElementRef;

  public archiveName: string;
  public archive: ArchiveVO;
  public payer: AccountVO;

  public showArchiveOptions = this.isMenuOpen('showArchiveOptions');
  public showAppsSubfolders = this.isMenuOpen('showAppsSubfolders');

  public appsSubfolders: FolderVO[] = [];

  public hoverOverArchiveName: boolean = false;

  private subscriptions: Subscription[] = [];
  private currentUrl: string;
  private urlMatches: Map<string, boolean> = new Map();
  private leftMenuDebug = debug('component:left-menu');

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private messageService: MessageService,
    private router: Router,
    private relationshipService: RelationshipService,
    private dialog: Dialog,
    private profile: ProfileService,
    private payerService: PayerService
  ) {
    if (this.accountService.getArchive()) {
      this.archive = this.accountService.getArchive();
      this.loadAppsSubfolders();
    }

    this.subscriptions.push(
      this.accountService.archiveChange.subscribe((archive: ArchiveVO) => {
        this.archive = archive;
        this.checkArchiveThumbnail();
        this.loadAppsSubfolders();
        this.setPayer(archive.payerAccountId);
      }),

      this.payerService.payerIdObs.subscribe((id) => {
        this.setPayer(id);
      })
    );

    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = this.router.url;
          this.urlMatches.clear();
        }
      })
    );
  }

  ngOnInit() {
    this.checkArchiveThumbnail();
    this.archive = this.accountService.getArchive();
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
    this.accountService.logOut().then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }

  checkMenuItemActive(urlSegment: string) {
    if (!this.urlMatches.has(urlSegment)) {
      this.urlMatches.set(
        urlSegment,
        this.currentUrl?.replace(/[()]/g, '').includes(urlSegment)
      );
    }

    return this.urlMatches.get(urlSegment);
  }

  async onConnectionsClick() {
    const connections = await this.relationshipService.get();
    this.dialog.open(
      'ConnectionsDialogComponent',
      { connections },
      { width: '1000px' }
    );
    this.showArchiveOptions = false;
  }

  async onProfileClick() {
    await this.profile.fetchProfileItems();
    this.dialog.open('ProfileEditComponent', null, {
      width: '100%',
      height: 'fullscreen',
      menuClass: 'profile-editor-dialog',
    });
    this.showArchiveOptions = false;
  }

  async onAllArchivesClick() {
    await this.accountService.refreshArchives();
    this.dialog.open('MyArchivesDialogComponent', null, { width: '1000px' });
    this.showArchiveOptions = false;
  }

  async onMembersClick() {
    const currentAccount = this.accountService.getAccount();
    const response = await this.api.archive.getMembers(
      this.accountService.getArchive()
    );
    const members = response.getAccountVOs();
    members.forEach((member: AccountVO) => {
      if (member.accountId === currentAccount.accountId) {
        member.isCurrent = true;
      }
    });
    this.dialog.open('MembersDialogComponent', { members }, { width: '800px' });
    this.showArchiveOptions = false;
  }

  async loadAppsSubfolders() {
    try {
      const apps = find(this.accountService.getRootFolder().ChildItemVOs, {
        type: 'type.folder.root.app',
      });
      const folderResponse = await this.api.folder.getWithChildren([
        new FolderVO(apps),
      ]);
      const appsFolder = folderResponse.getFolderVO(true);
      this.appsSubfolders = appsFolder.ChildItemVOs as FolderVO[];
    } catch (err) {
      Sentry.captureException(err);
      this.leftMenuDebug(
        'Error loading apps subfolders, silently failing',
        err
      );
    }
  }

  public toggleArchiveOptions(): void {
    this.showArchiveOptions = !this.showArchiveOptions;
    window.sessionStorage.setItem(
      'showArchiveOptions',
      (+this.showArchiveOptions).toString()
    );
  }

  public toggleAppsSubfolders(): void {
    this.showAppsSubfolders = !this.showAppsSubfolders;
    window.sessionStorage.setItem(
      'showAppsSubfolders',
      (+this.showAppsSubfolders).toString()
    );
  }

  public onHoverOverArchiveName(): void {
    this.hoverOverArchiveName = true;
  }

  public onHoverOutArchiveName(): void {
    this.hoverOverArchiveName = false;
  }

  protected isMenuOpen(key: string): boolean {
    return Boolean(window.sessionStorage.getItem(key));
  }

  private setPayer(id) {
    this.archive = this.accountService.getArchive();
    this.api.archive.getMembers(this.archive).then((response) => {
      const members = response.getAccountVOs();
      this.payer = members.find((member) => member.accountId === id);
    });
  }
}
