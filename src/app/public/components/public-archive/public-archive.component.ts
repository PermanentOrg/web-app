import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ArchiveVO, FolderVO } from '@models';
import { collapseAnimationCustom } from '@shared/animations';
import {
  FieldNameUIShort,
  ProfileItemVODictionary,
} from '@models/profile-item-vo';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { of, merge, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { SearchService } from '@search/services/search.service';
import { RouteData } from '@root/app/app.routes';

@Component({
  selector: 'pr-public-archive',
  templateUrl: './public-archive.component.html',
  styleUrls: ['./public-archive.component.scss'],
  animations: [collapseAnimationCustom(250)],
})
export class PublicArchiveComponent implements OnInit, OnDestroy {
  publicRoot: FolderVO;
  archive: ArchiveVO;
  profileItems: ProfileItemVODictionary = {};
  description: string;
  socialMedia: Record<string, string> = {};
  searchResults: any[] = [];

  waiting = true;

  types = {
    'type.folder.private': 'Folder',
    'type.folder.public': 'Folder',
    'type.record.image': 'Image',
    'type.record.video': 'Video',
  };

  query: string = '';

  isViewingProfile$ = merge(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => {
        if (event instanceof NavigationEnd) {
          return event.url.includes('/profile');
        }
      })
    ),
    of(this.router.url.includes('/profile'))
  );
  subscriptions: Subscription[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private publicProfile: PublicProfileService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data as RouteData;
    this.subscriptions.push(
      this.publicProfile
        .publicRoot$()
        .subscribe((root) => (this.publicRoot = root)),
      this.publicProfile
        .archive$()
        .subscribe((archive) => (this.archive = archive)),
      this.publicProfile
        .profileItemsDictionary$()
        .subscribe((items) => (this.profileItems = items)),
      this.publicProfile
        .profileItemsDictionary$()
        .subscribe(
          (items) => (this.description = items['description'][0].textData1)
        ),
      this.publicProfile.profileItemsDictionary$().subscribe((items) => {
        this.socialMedia['email'] = items['email'][0].string1;
        this.socialMedia['socialMedia'] = items['social_media'].find(
          (item) => !item.string1.includes('facebook')
        )?.string1;
        this.socialMedia['facebook'] = items['social_media'].find((item) =>
          item.string1.includes('facebook')
        )?.string1;
        return this.socialMedia;
      })
    );
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  hasSingleValueFor(field: FieldNameUIShort, column: ProfileItemsDataCol) {
    return (
      this.profileItems[field]?.length && this.profileItems[field][0][column]
    );
  }

  public onHandleSearch(value: string): void {
    try {
      this.router.navigate(['search', this.archive.archiveId, value], {
        relativeTo: this.route,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
