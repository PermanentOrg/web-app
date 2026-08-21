import { BaseVOData } from '@models/base-vo';

export type LocationPrecision = 'approximate' | 'uncertain' | 'unknown';

export enum LocationQualifier {
	Approximate = 'approximate',
	Uncertain = 'uncertain',
	Unknown = 'unknown',
}

/**
 * How sure we are of a place. `approximate` and `uncertain` can both apply;
 * `unknown` stands alone and means there is nothing to record. All three off
 * means the place is known exactly.
 */
export interface LocationQualifierFlags {
	approximate: boolean;
	uncertain: boolean;
	unknown: boolean;
}

export const DEFAULT_LOCATION_QUALIFIERS: LocationQualifierFlags = {
	approximate: false,
	uncertain: false,
	unknown: false,
};

export interface LocnVOData extends BaseVOData {
	locnId?: number;
	timeZoneId?: number;

	geoCodeLookup?: string;
	streetNumber?: string;
	streetName?: string;
	postalCode?: string;
	locality?: string;
	adminOneName?: string;
	adminOneCode?: string;
	adminTwoName?: string;
	adminTwoCode?: string;
	country?: string;
	countryCode?: string;
	geometryType?: string;
	latitude?: string | number;
	longitude?: string | number;
	boundSouth?: number;
	boundWest?: number;
	boundNorth?: number;
	boundEast?: number;
	geometryAsArray?: string;
	geoCodeType?: string;
	geoCodeResponseAsXml?: string;
	name?: string;
	sublocation?: string;
	city?: string;
	altitudeMeters?: number;
	locationPrecision?: LocationPrecision;
	status?: string;
	type?: string;
}
