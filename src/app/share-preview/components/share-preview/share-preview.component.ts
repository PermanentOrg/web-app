import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO, AccountVO } from '@models/index';
import { throttle } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-share-preview',
  templateUrl: './share-preview.component.html',
  styleUrls: ['./share-preview.component.scss']
})
export class SharePreviewComponent implements OnInit {
  bottomBannerVisible = true;


  archive: ArchiveVO = this.route.snapshot.data.shareByUrlVO.ArchiveVO;
  account: AccountVO = this.route.snapshot.data.shareByUrlVO.AccountVO;
  displayName: string = this.route.snapshot.data.currentFolder.displayName;

  isLoggedIn = false;

  showCover = false;
  showForm = false;

  shareToken: string;

  hasScrollTriggered = false;

  waiting = false;

  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private api: ApiService,
    private message: MessageService
  ) {
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.shareToken = this.route.snapshot.params.shareToken;
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.showCover = true;
    //   this.hideBottomBanner();
    // }, 2000);
  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  toggleCover() {
    this.showCover = !this.showCover;
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.scrollHandlerDebounced();
  }

  scrollCoverToggle() {
    if (!this.hasScrollTriggered) {
      this.hasScrollTriggered = true;
      setTimeout(() => {
        this.showCover = true;
      }, 0);
    }
  }

  async onRequestAccessClick() {
    try {
      this.waiting = true;
      await this.api.share.requestShareAccess(this.shareToken);
      this.message.showMessage(`Access requested. ${this.account.fullName} must approve your request.` , 'success');
      this.toggleCover();
    } catch (err) {
      if (err instanceof ShareResponse) {
        if (err.messageIncludesPhrase('share.already_exists')) {
          this.message.showError(`You have already requested access to this item.`);
        } else if (err.messageIncludesPhrase('same')) {
          this.message.showError(`You do not need to request access to your own item.`);
        }
      }
    } finally {
      this.waiting = false;
    }
  }

  stopPropagation(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

}
