import { Component, OnInit, HostBinding, AfterViewInit, OnDestroy, Optional } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ArchiveVO, FolderVO } from '@models';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { PublicLinkPipe } from '@shared/pipes/public-link.pipe';
import { collapseAnimationCustom } from '@shared/animations';
import { Dialog } from '@root/app/dialog/dialog.module';
import { FieldNameUIShort, ProfileItemVOData, ProfileItemVODictionary } from '@models/profile-item-vo';
import { MessageService } from '@shared/services/message/message.service';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { some, orderBy } from 'lodash';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss'],
  animations: [ collapseAnimationCustom(250) ]
})
export class PublicArchiveComponent implements OnInit {
  publicRoot: FolderVO;
  archive: ArchiveVO;

  profileItems: ProfileItemVODictionary = {};

  isViewingProfile$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => {
      if (event instanceof NavigationEnd) {
        return event.url.includes('/profile');
      }
    })
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    private ga: GoogleAnalyticsService,
    private linkPipe: PublicLinkPipe
  ) {
    this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.viewed.params);
  }

  ngOnInit(): void {
    const data = this.route.snapshot.data;

    this.publicRoot = data.publicRoot;
    this.archive = data.archive;
    this.buildProfileItemDictionary(data.profileItems);

    const hasPublicItems = some(data.profileItems as ProfileItemVOData[], i => i.publicDT && i.fieldNameUI !== 'profile.basic');

    if (!hasPublicItems) {
      this.router.navigate(['..'], { relativeTo: this.route });
      this.message.showError('This profile has no public information.');
    }
  }

  buildProfileItemDictionary(items: ProfileItemVOData[]) {
    this.profileItems = {};

    for (const item of items) {
      this.addProfileItemToDictionary(item);
    }

    this.orderItems('home');
    this.orderItems('location');
    this.orderItems('job');
  }

  orderItems(field: FieldNameUIShort, column: ProfileItemsDataCol = 'day1') {
    if (this.profileItems[field]?.length > 1) {
      this.profileItems[field] = orderBy(this.profileItems[field], column);
    }
  }

  addProfileItemToDictionary(item: ProfileItemVOData) {
    const fieldNameUIShort = item.fieldNameUI.replace('profile.', '');

    if (!this.profileItems[fieldNameUIShort]) {
      this.profileItems[fieldNameUIShort] = [ item ];
    } else {
      this.profileItems[fieldNameUIShort].push(item);
    }

    if (item.textData1) {
      item.textData1 = '<p>' + this.archive.description.replace(new RegExp('\n', 'g'), '</p><p>') + '</p>';
    }
  }

  hasSingleValueFor(field: FieldNameUIShort, column: ProfileItemsDataCol) {
    return this.profileItems[field]?.length && this.profileItems[field][0][column];
  }
}
