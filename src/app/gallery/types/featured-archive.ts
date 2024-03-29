/* @format */
import { ArchiveType } from '@models/archive-vo';

export interface FeaturedArchive {
  archiveNbr: string;
  name: string;
  type: ArchiveType;
  profileImage: string;
  bannerImage: string;
}
