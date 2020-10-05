import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveVO } from '@models';
import { ProfileItemVODictionary, ProfileItemVOData } from '@models/profile-item-vo';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { Observable, Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { map } from 'rxjs/operators';
import { concat, orderBy } from 'lodash';

@Component({
  selector: 'pr-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit, OnDestroy, HasSubscriptions {
  archive: ArchiveVO;
  profileItems: ProfileItemVODictionary = {};
  milestones$: Observable<ProfileItemVOData[]>;

  subscriptions: Subscription[] = [];
  constructor(
    private publicProfile: PublicProfileService
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.publicProfile.archive$().subscribe(archive => this.archive = archive),
      this.publicProfile.profileItemsDictionary$().subscribe(items => this.profileItems = items)
    );

    this.milestones$ = this.publicProfile.profileItemsDictionary$().pipe(
      map(profileItems => {
        const milestones = concat(profileItems['job'] || [], profileItems['home'] || [], profileItems['milestone'] || []);
        console.log(milestones);
        return orderBy(milestones, i => i.day1, 'desc');
      })
    );
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }
}
