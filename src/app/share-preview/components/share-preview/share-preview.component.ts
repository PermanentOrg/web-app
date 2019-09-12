import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO, AccountVO } from '@models/index';
import { throttle } from 'lodash';

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

  showCover = false;
  showForm = false;

  hasScrollTriggered = false;

  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    console.log(route.snapshot.data.shareByUrlVO);
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

  onSignupClick() {
    this.router.navigate(['/auth', 'signup'], {queryParams: { shareToken: this.route.snapshot.params.shareToken }})
      .then(done => {
        this.showForm = true;
      });
  }

  onLoginClick() {
    this.router.navigate(['/auth', 'login'], {queryParams: { shareToken: this.route.snapshot.params.shareToken }})
      .then(done => {
        this.showForm = true;
      });
  }

  stopPropagation(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log(evt);
  }

}
