import { Pipe, PipeTransform } from '@angular/core';
import { TimezoneVOData } from '@models';
import { DatePipe } from '@angular/common';
import { moment } from '@permanent.org/vis-timeline';
import { checkOffsetFormat, getOffsetMomentFromDTString } from '@shared/utilities/dateTime';

export const MOMENT_DATE_FORMAT = {
  full: 'YYYY-MM-DD hh:mm A',
  fullSeconds: 'YYYY-MM-DD hh:mm:ss A',
  full24: 'YYYY-MM-DD HH:mm',
  date: 'YYYY-MM-DD',
  time: 'hh:mm A',
  time24: 'HH:mm'
};

export const NG_DATE_FORMAT = {
  full: 'yyyy-MM-dd hh:mm a',
  fullSeconds: 'yyyy-MM-dd hh:mm:ss a',
  full24: 'yyyy-MM-dd HH:mm',
  date: 'yyyy-MM-dd',
  time: 'hh:mm a',
  time24: 'HH:mm'
};

@Pipe({
  name: 'prDate'
})
export class PrDatePipe implements PipeTransform {

  constructor(
  ) { }

  transform(dtString: string, timezoneVO?: TimezoneVOData): any {
    const dt = moment.utc(dtString);

    if (!timezoneVO) {
      return moment.utc(dtString).local();
    }

    const isDST = dt.clone().local().isDST();

    const offset = isDST ? timezoneVO.dstOffset : timezoneVO.stdOffset;

    const abbrev = isDST ? timezoneVO.dstAbbrev : timezoneVO.stdAbbrev;

    const dtWithTz = getOffsetMomentFromDTString(dtString);;

    return dtWithTz.format(MOMENT_DATE_FORMAT.full + ` [${abbrev}]`);
  }
}
