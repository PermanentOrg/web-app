import { BaseVO } from '@models/base-vo';

export interface TimezoneVOData {
  timeZoneId: number;
  displayName: string;
  timeZonePlace: string;
  stdName: string;
  stdAbbrev: string;
  stdOffset: string;
  dstName: string;
  dstAbbrev: string;
  dstOffset: string;
}

export class TimezoneVO extends BaseVO {
  public timeZoneId: number;
  public displayName: string;
  public timeZonePlace: string;
  public stdName: string;
  public stdAbbrev: string;
  public stdOffset: string;
  public dstName: string;
  public dstAbbrev: string;
  public dstOffset: string;
}
