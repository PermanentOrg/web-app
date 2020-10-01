import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveVO } from '@models';
import { ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { ProfileItemsDataCol } from '@shared/services/profile/profile.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';

@Component({
  selector: 'pr-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit, OnDestroy, HasSubscriptions {
  archive: ArchiveVO;
  profileItems: ProfileItemVODictionary = {};

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
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }
}
