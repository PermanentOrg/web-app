import { BaseVOData } from '@models/base-vo';
import { LocnVOData } from './locn-vo';
import { TimezoneVOData } from './timezone-vo';

export type FieldNameUI =
'profile.basic' |
'profile.birth_info' |
'profile.blurb' |
'profile.closure_info' |
'profile.death_info' |
'profile.description' |
'profile.established_info' |
'profile.email' |
'profile.gender' |
'profile.home' |
'profile.job' |
'profile.location' |
'profile.phone_nbr' |
'profile.social_media' |
'profile.timezone';

type ProfileItemType =
  'type.widget.string' |
  'type.widget.wysiwyg' |
  'type.widget.locn' |
  'type.widget.date' |
  'type.widget.timezone'
  ;

export interface ProfileItemVOData extends BaseVOData {
  profile_itemId: number;
  archiveId: number;
  fieldNameUI: FieldNameUI;
  string1: string;
  string2: string;
  string3: string;
  int1: number;
  int2: number;
  int3: number;
  datetime1: string;
  datetime2: string;
  day1: string;
  day2: string;
  locnId1: number;
  locnId2: number;
  text_dataId1: number;
  text_dataId2: number;
  otherId1: number;
  otherId2: number;
  archiveArchiveNbr: string;
  recordArchiveNbr: string;
  folderArchiveNbr: string;
  isVisible: 0 | 1;
  publicDT;

  type: ProfileItemType;

  LocnVOs: LocnVOData[];
  TimezoneVO: TimezoneVOData;
  textData1: string;
  textData2: string;

  archiveNbr:  string;
}
