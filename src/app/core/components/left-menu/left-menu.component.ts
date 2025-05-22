/* @format */
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
import { ArchiveVO, AccountVO, FolderVO } from '@root/app/models';
import { Subscription } from 'rxjs';
import {
  ngIfSlideInAnimation,
  ngIfScaleHeightAnimation,
} from '@shared/animations';
import { RelationshipService } from '@core/services/relationship/relationship.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { ApiService } from '@shared/services/api/api.service';
import { ProfileService } from '@shared/services/profile/profile.service';
import { PayerService } from '@shared/services/payer/payer.service';
import { EventService } from '@shared/services/event/event.service';
import { GetThumbnail } from '@models/get-thumbnail';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { ConnectionsDialogComponent } from '../connections-dialog/connections-dialog.component';
import { ProfileEditComponent } from '../profile-edit/profile-edit.component';
import { MyArchivesDialogComponent } from '../my-archives-dialog/my-archives-dialog.component';
import { MembersDialogComponent } from '../members-dialog/members-dialog.component';

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
    private dialog: DialogCdkService,
    private profile: ProfileService,
    private payerService: PayerService,
    private event: EventService,
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
      }),
    );

    this.subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = this.router.url;
          this.urlMatches.clear();
        }
      }),
    );
  }

  ngOnInit() {
    this.checkArchiveThumbnail();
    this.archive = this.accountService.getArchive();
  }

  checkArchiveThumbnail() {
    if (!GetThumbnail(this.archive, 500)) {
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
      this.messageService.showMessage({
        message: `Logged out successfully`,
        style: 'success',
      });
      this.router.navigate(['/login']);
    });
  }

  checkMenuItemActive(urlSegment: string) {
    if (!this.urlMatches.has(urlSegment)) {
      this.urlMatches.set(
        urlSegment,
        this.currentUrl?.replace(/[()]/g, '').includes(urlSegment),
      );
    }

    return this.urlMatches.get(urlSegment);
  }

  async onConnectionsClick() {
    const connections = await this.relationshipService.get();
    this.dialog.open(ConnectionsDialogComponent, {
      data: { connections },
      width: '1000px',
    });
    this.showArchiveOptions = false;
  }

  async onProfileClick() {
    await this.profile.fetchProfileItems();
    this.dialog.open(ProfileEditComponent, {
      width: '100%',
      height: 'fullscreen',
    });
    this.showArchiveOptions = false;
  }

  async onAllArchivesClick() {
    await this.accountService.refreshArchives();
    this.dialog.open(MyArchivesDialogComponent, { width: '1000px' });
    this.showArchiveOptions = false;
  }

  async onMembersClick() {
    const currentAccount = this.accountService.getAccount();
    const response = await this.api.archive.getMembers(
      this.accountService.getArchive(),
    );
    const members = response.getAccountVOs();
    members.forEach((member: AccountVO) => {
      if (member.accountId === currentAccount.accountId) {
        member.isCurrent = true;
      }
    });
    this.dialog.open(MembersDialogComponent, { data: members, width: '800px' });
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
      const appsFolder = (folderResponse as FolderResponse).getFolderVO(true);
      this.appsSubfolders = appsFolder.ChildItemVOs as FolderVO[];
    } catch (err) {
      Sentry.captureException(err);
      this.leftMenuDebug(
        'Error loading apps subfolders, silently failing',
        err,
      );
    }
  }

  public toggleArchiveOptions(): void {
    this.showArchiveOptions = !this.showArchiveOptions;
    if (this.showArchiveOptions) {
      this.event.dispatch({
        entity: 'account',
        action: 'open_archive_menu',
      });
    }
    window.sessionStorage.setItem(
      'showArchiveOptions',
      (+this.showArchiveOptions).toString(),
    );
  }

  public toggleAppsSubfolders(): void {
    this.showAppsSubfolders = !this.showAppsSubfolders;
    window.sessionStorage.setItem(
      'showAppsSubfolders',
      (+this.showAppsSubfolders).toString(),
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
