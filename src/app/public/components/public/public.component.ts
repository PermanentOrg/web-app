import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { ArchiveVO, AccountVO } from '@models/index';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit, OnDestroy {
  @HostBinding('class.for-record') isRecord: boolean;

  bottomBannerVisible = false;

  public account: AccountVO = this.accountService.getAccount();
  public archive: ArchiveVO = this.accountService.getArchive();
  public isLoggedIn = this.accountService.isLoggedIn;

  public publishArchive: ArchiveVO;
  public displayName: string;

  public isSearchFocused = false;
  public isNavigating = false;

  public missing = false;

  routerListener: Subscription;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private router: Router
  ) {
    this.routerListener = this.router.events
      .pipe(filter((event) => {
        return event instanceof NavigationStart || event instanceof NavigationEnd;
      })).subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating = true;
        } else if (event instanceof NavigationEnd) {
          this.isNavigating = false;
          this.ngOnInit();
        }
      });
  }

  ngOnInit() {
    const publishedItem = this.route.snapshot.firstChild.data.publishedItem;

    if (!publishedItem) {
      this.missing = true;
      this.publishArchive = null;
      return;
    }

    this.isRecord = !!publishedItem.recordId;
    this.displayName = publishedItem.displayName;

    const hasNavigated = !!this.route.snapshot.firstChild.firstChild.firstChild.params.archiveNbr;

    if (!this.isRecord && !hasNavigated) {
      const urlToken = this.route.snapshot.firstChild.firstChild.params.publishUrlToken;
      const folder = this.route.snapshot.firstChild.data.publishedItem;
      this.router.navigate(['/p', urlToken, folder.archiveNbr, folder.folder_linkId]);
    }

    this.publishArchive = this.route.snapshot.firstChild.firstChild.data.archive;
  }

  ngOnDestroy() {
    this.routerListener.unsubscribe();
  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  onSignupClick() {
    window.location.pathname = '/';
  }

  onArchiveThumbClick() {

  }

  onMyAccountClick() {

  }

  onSearchBarFocusChange(isFocused: boolean) {
    this.isSearchFocused = isFocused;
  }

}
