import { Component, OnInit, HostBinding, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { Subscription } from 'rxjs';
import { DataService } from '@shared/services/data/data.service';
import { DeviceService } from '@shared/services/device/device.service';
import { PromptService } from '@core/services/prompt/prompt.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { READ_ONLY_FIELD } from '@shared/components/prompt/prompt-fields';
import { Deferred } from '@root/vendor/deferred';
import { copyFromInputElement } from '@shared/utilities/forms';
import { PublicLinkPipe } from '@shared/pipes/public-link.pipe';
import { AccountService } from '@shared/services/account/account.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss']
})
export class PublicArchiveComponent implements OnInit, OnDestroy {
  public archive: ArchiveVO;
  public description: string;
  public isArchiveRoot = false;
  public showFolderDescription = false;
  public isMobile = this.device.isMobileWidth();

  public get cta() {
    return this.data.publicCta;
  }

  containerFlexSubscription: Subscription;
  @HostBinding('class.container-vertical-flex') containerVerticalFlex: boolean;

  constructor(
    private account: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private folderView: FolderViewService,
    private data: DataService,
    private device: DeviceService,
    private prompt: PromptService,
    private ga: GoogleAnalyticsService,
    private linkPipe: PublicLinkPipe
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

    this.isArchiveRoot = !!this.data.currentFolder.type.includes('root');
    this.showFolderDescription = !this.isArchiveRoot && this.data.currentFolder.view !== FolderView.Timeline;

    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.viewed.params);

    if (this.archive.description && this.isArchiveRoot) {
      this.description = '<p>' + this.archive.description.replace(new RegExp('\n', 'g'), '</p><p>') + '</p>';
    } else {
      this.description = null;
    }
  }

  ngOnDestroy() {
    this.containerFlexSubscription.unsubscribe();
  }

  onCtaClick() {
    switch (this.cta) {
      case 'timeline':
        const queryParams = { cta: 'timeline', eventCategory: 'Publish by url' };
        if (this.account.isLoggedIn()) {
          if (this.device.isMobile()) {
            this.router.navigate(['/public'], { queryParams });
          } else {
            window.location.assign('/app/public?cta=timeline');
          }
        } else {
          this.router.navigate(['/auth', 'signup'], { queryParams });
        }
        break;
    }
  }

  onShareClick() {
    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.reshare.params);

    const url = this.linkPipe.transform(this.data.currentFolder);
    const fields = [
      READ_ONLY_FIELD('publicLink', 'Public link', url)
    ];

    const deferred = new Deferred();

    this.prompt.prompt(fields, 'Share public link', deferred.promise, 'Copy link')
    .then(() => {
      const input = this.prompt.getInput('publicLink');
      copyFromInputElement(input);
      deferred.resolve();
    })
    .catch((err) => {
      console.error(err);
    });
  }

  async onCtaClickMobile() {
    switch (this.cta) {
      case 'timeline':
        try {
          if (await this.prompt.confirm('Continue', 'Create your own timeline?')) {
            this.onCtaClick();
          }
        } catch (err) { }
        break;
    }
  }

  onArchiveThumbClick() {
    this.router.navigate(['/p', 'archive', this.archive.archiveNbr]);
  }
}
