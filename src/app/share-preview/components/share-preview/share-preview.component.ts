import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-share-preview',
  templateUrl: './share-preview.component.html',
  styleUrls: ['./share-preview.component.scss']
})
export class SharePreviewComponent implements OnInit {
  bottomBannerVisible = true;

  archive: ArchiveVO = this.route.snapshot.data.archive;
  displayName: string = this.route.snapshot.data.previewItem.displayName;
  previewItem: any = this.route.snapshot.data.previewItem;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.router.navigate(['signup'], { relativeTo: this.route });

  }

  hideBottomBanner() {
    this.bottomBannerVisible = false;
  }

  onSignupClick() {
    window.location.pathname = '/';
  }

}
