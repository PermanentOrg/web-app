import { Component, OnInit, Inject, Optional, HostBinding } from '@angular/core';
import { FolderVO, ArchiveVO } from '@models';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileItemVOData, ProfileItemVODictionary, FieldNameUIShort } from '@models/profile-item-vo';
import { ProfileItemsDataCol, ALWAYS_PUBLIC } from '@shared/services/profile/profile.service';
import { orderBy, some } from 'lodash';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  publicRoot: FolderVO;
  archive: ArchiveVO;

  profileItems: ProfileItemVODictionary = {};

  publicArchivePath: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService
  ) {
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
