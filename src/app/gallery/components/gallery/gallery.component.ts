/* @format */
import { Component, Inject, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { FeaturedArchive } from '../../types/featured-archive';
import {
  FEATURED_ARCHIVE_API,
  FeaturedArchiveApi,
} from '../../types/featured-archive-api';
import { EventService } from '@shared/services/event/event.service';

@Component({
  selector: 'pr-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  public isLoggedIn: boolean;
  public archives: FeaturedArchive[] = [];
  public loading = true;

  constructor(
    @Inject(FEATURED_ARCHIVE_API) private api: FeaturedArchiveApi,
    private accountService: AccountService,
    private event: EventService,
  ) {
    this.isLoggedIn = this.accountService.isLoggedIn();
    this.event.dispatch({
      entity: 'account',
      action: 'view_public_gallery',
    });
  }

  async ngOnInit() {
    try {
      this.archives = await this.api.getFeaturedArchiveList();
    } catch {
      // do nothing
    } finally {
      this.loading = false;
    }
  }
}
