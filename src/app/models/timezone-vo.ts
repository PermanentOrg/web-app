import { BaseVO } from '@models/base-vo';

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
