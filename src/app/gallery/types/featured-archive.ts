/* @format */
import { ArchiveType } from '@models/archive-vo';

export interface FeaturedArchive {
  archiveNbr: string;
  name: string;
  type: ArchiveType;
  thumbUrl: string;
  bannerUrl: string;
}
