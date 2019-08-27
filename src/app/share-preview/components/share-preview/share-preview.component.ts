import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { throttle } from 'lodash';

@Component({
  selector: 'pr-share-preview',
  templateUrl: './share-preview.component.html',
  styleUrls: ['./share-preview.component.scss']
})
export class SharePreviewComponent implements OnInit {
  bottomBannerVisible = true;

  archive: ArchiveVO = this.route.snapshot.data.archive;
  displayName: ArchiveVO = this.route.snapshot.data.previewItem.displayName;

  showCover = false;
  showForm = false;

  hasScrollTriggered = false;

  scrollHandlerDebounced = throttle(() => { this.scrollCoverToggle(); }, 500);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

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
    this.hideBottomBanner();
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
        this.hideBottomBanner();
        this.showCover = true;
      }, 0);
    }
  }

  onSignupClick() {
    window.location.pathname = '/';
  }

  showSignupForm() {
    this.showForm = true;
    this.router.navigate(['signup'], { relativeTo: this.route });
  }

  showLoginForm() {
    this.showForm = true;
    this.router.navigate(['login'], { relativeTo: this.route });
  }

  stopPropagation(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log(evt);
  }

}
