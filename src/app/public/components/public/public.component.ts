import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  @HostBinding('class.for-record') isRecord: boolean;

  bottomBannerVisible = true;

  public archive: ArchiveVO;
  public displayName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    const publishedItem = this.route.snapshot.firstChild.data.publishedItem;
    this.isRecord = !!publishedItem.recordId;
    this.displayName = publishedItem.displayName;

    const hasNavigated = !!this.route.snapshot.firstChild.firstChild.firstChild.params.archiveNbr;

    if (!this.isRecord && !hasNavigated) {
      const urlToken = this.route.snapshot.firstChild.firstChild.params.publishUrlToken;
      const folder = this.route.snapshot.firstChild.data.publishedItem;
      this.router.navigate(['/p', urlToken, folder.archiveNbr, folder.folder_linkId]);
    }

    this.archive = this.route.snapshot.firstChild.firstChild.data.archive;
  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  onSignupClick() {
    window.location.pathname = '/';
  }

}
