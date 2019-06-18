import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pr-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  @HostBinding('class.for-record') isRecord: boolean;

  bottomBannerVisible = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.isRecord = !!this.route.snapshot.firstChild.data.publishedItem.recordId;

    if (!this.isRecord) {
      const urlToken = this.route.snapshot.firstChild.firstChild.params.publishUrlToken;
      const folder = this.route.snapshot.firstChild.data.publishedItem;
      this.router.navigate(['/p', urlToken, folder.archiveNbr, folder.folder_linkId]);
    }
  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  onSignupClick() {
    window.location.pathname = '/';
  }

}
