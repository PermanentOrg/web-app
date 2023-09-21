/* @format */
import { InjectionToken } from '@angular/core';
import { FeaturedArchive } from './featured-archive';

export interface FeaturedArchiveApi {
  getFeaturedArchiveList: () => Promise<FeaturedArchive[]>;
}

class NullFeaturedArchiveApi implements FeaturedArchiveApi {
  public async getFeaturedArchiveList() {
    return [];
  }
}

export const FEATURED_ARCHIVE_API = new InjectionToken<FeaturedArchiveApi>(
  'FeaturedArchiveApi',
  {
    providedIn: 'root',
    factory() {
      return new NullFeaturedArchiveApi();
    },
  }
);
