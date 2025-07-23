import { AnnouncementEvent } from '../models/announcement-event';

export const ANNOUNCEMENT_EVENTS: AnnouncementEvent[] = [
	{
		start: new Date('2025-01-29T00:00:00-07:00').getTime(),
		end: new Date('2025-01-31T03:00:00-07:00').getTime(),
		message:
			'The Permanent.org platform may be briefly unavailable on <strong>January 30th at 9:00 PM MST</strong> for routine maintenance. Thank you for your patience.',
	},
	{
		start: new Date('2023-01-31T20:00:00-05:00').getTime(),
		end: new Date('2023-02-15T23:59:00-05:00').getTime(),
		message:
			'Enter the <strong>2023 Share to Win! Giveaway</strong> for a chance to win prizes up to $450 in value. <a href="https://www.permanent.org/blog/sharetowin/">Click here for details.</a>',
	},
];
