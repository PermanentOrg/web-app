import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ArchiveVO, FolderVO } from '@models';
import { collapseAnimationCustom } from '@shared/animations';
import { FieldNameUIShort, ProfileItemVODictionary } from '@models/profile-item-vo';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { of, merge, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss'],
  animations: [ collapseAnimationCustom(250) ]
})
export class PublicArchiveComponent implements OnInit, OnDestroy {
  publicRoot: FolderVO;
  archive: ArchiveVO;
  profileItems: ProfileItemVODictionary = {};

  isViewingProfile$ = merge(
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => {
          if (event instanceof NavigationEnd) {
            return event.url.includes('/profile');
          }
        }),
      ),
    of(this.router.url.includes('/profile'))
  );
  subscriptions: Subscription[] = [];
  constructor(
    private router: Router,
    private publicProfile: PublicProfileService
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.publicProfile.publicRoot$().subscribe(root => this.publicRoot = root),
      this.publicProfile.archive$().subscribe(archive => this.archive = archive),
      this.publicProfile.profileItemsDictionary$().subscribe(items => this.profileItems = items)
    );
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  hasSingleValueFor(field: FieldNameUIShort, column: ProfileItemsDataCol) {
    return this.profileItems[field]?.length && this.profileItems[field][0][column];
  }
}
