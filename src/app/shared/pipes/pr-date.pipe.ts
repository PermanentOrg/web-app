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

  transform(dtString: string | number, timezoneVO?: TimezoneVOData, part?: 'date' | 'time'): any {
    if (!dtString) {
      return;
    }

    const dt = moment.utc(dtString);

    let outputDt: moment.Moment;
    let abbrev = '';

    if (!timezoneVO) {
      outputDt = moment.utc(dtString).local();
    } else {
      const isDST = dt.clone().local().isDST();
      abbrev = isDST ? timezoneVO.dstAbbrev : timezoneVO.stdAbbrev;
      outputDt = getOffsetMomentFromDTString(dtString as string);
    }

    switch (part) {
      case 'date':
        return outputDt.format(MOMENT_DATE_FORMAT.date);
      case 'time':
        return outputDt.format(MOMENT_DATE_FORMAT.time + ` [${abbrev}]`);
      default:
        return outputDt.format(MOMENT_DATE_FORMAT.full + ` [${abbrev}]`);
    }
  }
}
