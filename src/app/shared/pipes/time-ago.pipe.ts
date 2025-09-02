import { Pipe, PipeTransform } from '@angular/core';
import { getUtcMomentFromDTString } from '@shared/utilities/dateTime';
import moment from 'moment';

moment.updateLocale('en', {
	relativeTime: {
		future: 'in %s',
		past: '%s ago',
		s: 'now',
		ss: '%ds',
		m: '1m',
		mm: '%dm',
		h: '1h',
		hh: '%dh',
		d: '1d',
		dd: '%dd',
		M: '1mo',
		MM: '%dmo',
		y: '1y',
		yy: '%dy',
	},
});

@Pipe({
	name: 'timeAgo',
	standalone: false,
})
export class TimeAgoPipe implements PipeTransform {
	transform(datetime: string): any {
		const utcDt = getUtcMomentFromDTString(datetime);
		return utcDt.fromNow(true);
	}
}
