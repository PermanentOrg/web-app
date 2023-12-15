/* @format */
import { InjectionToken } from '@angular/core';
import { FeaturedArchive } from './featured-archive';

export interface FeaturedArchiveApi {
  getFeaturedArchiveList: () => Promise<FeaturedArchive[]>;
}

export const FEATURED_ARCHIVE_API = new InjectionToken<FeaturedArchiveApi>(
  'FeaturedArchiveApi'
);
