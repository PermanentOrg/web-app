import { AnnouncementEvent } from '../models/announcement-event';

export const ANNOUNCEMENT_EVENTS: AnnouncementEvent[] = [
  {
    start: new Date('2023-01-31T20:00:00-05:00').getTime(),
    end: new Date('2023-02-15T23:59:00-05:00').getTime(),
    message:
      'Enter the <strong>2023 Share to Win! Giveaway</strong> for a chance to win prizes up to $450 in value. <a href="https://www.permanent.org/blog/sharetowin/">Click here for details.</a>',
  },
];
