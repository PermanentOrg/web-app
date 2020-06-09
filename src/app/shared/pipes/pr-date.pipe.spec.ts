import { TimezoneVOData, TimezoneVO } from '@models';
import { PrDatePipe } from './pr-date.pipe';
import { formatDateISOString } from '@shared/utilities/dateTime';

describe('PrDatePipe', () => {
  it('create an instance', () => {
    const pipe = new PrDatePipe();
    expect(pipe).toBeTruthy();
  });

  // it('transforms a DST date in Pacific time', () => {
  //   const pipe = new PrDatePipe();
  //   const displayDT = formatDateISOString('2017-05-13T16:36:29.000000');
  //   const timezoneVO: TimezoneVOData = {
  //     dstAbbrev: 'PDT',
  //     dstOffset: '-07:00',
  //     stdAbbrev: 'PST',
  //     stdOffset: '-08:00',
  //   };
  //   const output = pipe.transform(displayDT, timezoneVO);
  //   expect(output).toContain('PDT');
  //   expect(output).toContain('9:36');
  // });

  // it('transforms a standard date in Pacific time', () => {
  //   const pipe = new PrDatePipe();
  //   const displayDT = formatDateISOString('2017-02-13T16:36:29.000000');
  //   const timezoneVO: TimezoneVOData = {
  //     dstAbbrev: 'PDT',
  //     dstOffset: '-07:00',
  //     stdAbbrev: 'PST',
  //     stdOffset: '-08:00',
  //   };
  //   const output = pipe.transform(displayDT, timezoneVO);
  //   expect(output).toContain('PST');
  //   expect(output).toContain('8:36');
  // });
});
