import { BaseVOData } from '@models/base-vo';

export interface LocnVOData extends BaseVOData {
	locnId?: number;
	timeZoneId?: number;

	displayName?: string;
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
	status?: string;
	type?: string;
}
