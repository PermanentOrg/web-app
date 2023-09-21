/* @format */
import { Component, Inject, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { FeaturedArchive } from '../../types/featured-archive';
import {
  FEATURED_ARCHIVE_API,
  FeaturedArchiveApi,
} from '../../types/featured-archive-api';

@Component({
  selector: 'pr-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  public isLoggedIn: boolean;
  public archives: FeaturedArchive[] = [];

  constructor(
    @Inject(FEATURED_ARCHIVE_API) private api: FeaturedArchiveApi,
    private accountService: AccountService
  ) {
    this.isLoggedIn = this.accountService.isLoggedIn();
  }

  async ngOnInit() {
    try {
      this.archives = await this.getFeaturedArchives();
    } catch {
      // do nothing
    }
  }

  public async getFeaturedArchives(): Promise<FeaturedArchive[]> {
    return this.api.getFeaturedArchiveList();
  }
}
