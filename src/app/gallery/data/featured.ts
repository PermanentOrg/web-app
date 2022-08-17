import { FeaturedArchive } from '../types/featured-archive';

// The featured archives are stored in an array of FeaturedArchive objects.
// To use in .env, simply make an array of these objects in JSON format.

export const featuredArchives: FeaturedArchive[] = [
  {
    archiveNbr: '03pw-0000',
    name: 'The Astoria Public Archive',
    type: 'type.archive.organization',
    description: '',
  },
  {
    archiveNbr: '03z2-0000',
    name: 'The Paxman - Moody Archive',
    type: 'type.archive.organization',
    description: '',
  },
  {
    archiveNbr: 'profile',
    name: 'The Maine Genealogy Archive',
    type: 'type.archive.family',
    description: '',
  },
  {
    archiveNbr: '03fm-0000',
    name: 'The Pinson, Tarrant, Tuagilelagi Archive',
    type: 'type.archive.family',
    description: '',
  },
  {
    archiveNbr: '02zq-0000',
    name: 'The Jewish Historical Society of the Upper Midwest Archive',
    type: 'type.archive.organization',
    description: '',
  },
  {
    archiveNbr: '00h3-0000',
    name: 'The Tia Stenson Family History Archive',
    type: 'type.archive.family',
    description: '',
  },
  {
    archiveNbr: '0532-0000',
    name: 'The Soap Box Derby Archive',
    type: 'type.archive.family',
    description: '',
  },
  {
    archiveNbr: '03fw-0000',
    name: 'The Cape Cod Makers Archive',
    type: 'type.archive.family',
    description: '',
  },
];
