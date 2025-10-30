import { Injectable } from '@angular/core';
import { getSQLDateTime } from '@shared/utilities/dateTime';
import { addDays, differenceInHours } from 'date-fns';

export enum Expiration {
	Never = 'Never',
	Day = '1 day',
	Week = '1 week',
	Month = '1 month',
	Year = '1 year',
	Other = 'Other',
}

export enum ExpirationDays {
	Day = 1,
	Week = 7,
	Month = 30,
	Year = 365,
}

@Injectable({
	providedIn: 'root',
})
export class ShareLinkMappingService {
	calculateAccessRestrictions(linkType: string, autoApprove: number): string {
		if (linkType === 'public') {
			return 'none';
		}
		if (autoApprove === 1) {
			return 'account';
		} else {
			return 'approval';
		}
	}

	getExpirationFromExpirationTimestamp(
		expirationTimestamp: Date,
		createdAt: Date,
	): Expiration {
		if (!expirationTimestamp) {
			return Expiration.Never;
		}

		const diff = differenceInHours(
			new Date(expirationTimestamp),
			new Date(createdAt),
		);

		if (diff <= 24 * ExpirationDays.Day) {
			return Expiration.Day;
		} else if (diff <= 24 * ExpirationDays.Week) {
			return Expiration.Week;
		} else if (diff <= 24 * 7 * ExpirationDays.Month) {
			return Expiration.Month;
		} else if (diff <= 24 * 7 * ExpirationDays.Year) {
			return Expiration.Year;
		} else {
			return Expiration.Other;
		}
	}

	getExpiresDTFromExpiration(
		expiration: Expiration,
		createdAt: Date,
	): string | null {
		switch (expiration) {
			case Expiration.Never:
				return null;
			case Expiration.Day:
				return getSQLDateTime(addDays(new Date(createdAt), 1));
			case Expiration.Week:
				return getSQLDateTime(addDays(new Date(createdAt), 7));
			case Expiration.Month:
				return getSQLDateTime(addDays(new Date(createdAt), 30));
			case Expiration.Year:
				return getSQLDateTime(addDays(new Date(createdAt), 365));
			default:
				return null;
		}
	}
}
