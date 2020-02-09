import { Component, OnInit, HostBinding, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { Subscription } from 'rxjs';
import { DataService } from '@shared/services/data/data.service';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss']
})
export class PublicArchiveComponent implements OnInit, OnDestroy {
  public archive: ArchiveVO;
  public description: string;
  public get cta() {
    return this.data.publicCta;
  }

  containerFlexSubscription: Subscription;
  @HostBinding('class.container-vertical-flex') containerVerticalFlex: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private folderView: FolderViewService,
    private data: DataService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.ngOnInit();
      }
    });

    this.containerVerticalFlex = this.folderView.containerFlex;

    this.containerFlexSubscription = this.folderView.containerFlexChange.subscribe(x => {
      this.containerVerticalFlex = x;
    });
  }

  ngOnInit() {
    this.archive = this.route.snapshot.data['archive'];

    if (this.archive.description) {
      this.description = '<p>' + this.archive.description.replace(new RegExp('\n', 'g'), '</p><p>') + '</>';
    } else {
      this.description = null;
    }
  }

  ngOnDestroy() {
    this.containerFlexSubscription.unsubscribe();
  }

  showDescription() {
    return this.data.showPublicArchiveDescription;
  }

  onCtaClick() {
    switch (this.cta) {
      case 'timeline':
        const queryParams = { cta: 'timeline' };
        this.router.navigate(['/auth', 'signup'], { queryParams });
        break;
    }
  }

  onArchiveThumbClick() {
    this.router.navigate(['/p', 'archive', this.archive.archiveNbr]);
  }
}
