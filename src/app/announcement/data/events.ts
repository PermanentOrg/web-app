import { AnnouncementEvent } from '../models/announcement-event';

export const ANNOUNCEMENT_EVENTS: AnnouncementEvent[] = [
  {
    start: new Date('2022-10-18T20:00:00-05:00').getTime(),
    end: new Date('2022-10-25T20:10:00-05:00').getTime(),
    message:
      'We will be performing scheduled maintenance on <time datetime="2022-10-25 18:00:00 PDT"><strong>Tuesday, October 25th</strong> between <strong> 9pm - 12am ET / 6pm - 9pm PT.</strong></time> During this time, members will be unable to log into Permanent.org.',
  },
];
