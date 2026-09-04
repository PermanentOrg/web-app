import { LocnVOData } from '@models';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;
const MINUTES_PER_DEGREE = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DEGREE = MINUTES_PER_DEGREE * SECONDS_PER_MINUTE;
const TENTHS_PER_SECOND = 10;

const PAIR_SEPARATOR = '  ';

const SIGNED_NUMBER = String.raw`[+-]?\d+(?:\.\d+)?`;
const UNSIGNED_NUMBER = String.raw`\d+(?:\.\d+)?`;
const DEGREE_MARK = String.raw`[°º]?`;
const MINUTE_MARK = String.raw`['′]`;
const SECOND_MARK = String.raw`''|"|″`;
const HEMISPHERE_LETTER = String.raw`[NSEW]`;

const ANGLE = String.raw`(${SIGNED_NUMBER})\s*${DEGREE_MARK}\s*(?:(${UNSIGNED_NUMBER})\s*${MINUTE_MARK}\s*(?:(${UNSIGNED_NUMBER})\s*(?:${SECOND_MARK})\s*)?)?(${HEMISPHERE_LETTER})?`;
const CAPTURES_PER_ANGLE = 4;

/**
 * Required, because `38.70` otherwise reads as the pair 38.7 and 0: the
 * decimal point ends the first number and the digits after it begin a second.
 */
const ANGLE_SEPARATOR = String.raw`(?:\s*[,;]\s*|\s+)`;

const COORDINATE_PAIR = new RegExp(
	`^\\s*${ANGLE}${ANGLE_SEPARATOR}${ANGLE}\\s*$`,
	'i',
);

const LATITUDE_HEMISPHERES = ['N', 'S'];
const NEGATIVE_HEMISPHERES = ['S', 'W'];

interface Angle {
	degrees: number;
	minutes: number;
	seconds: number;
	hemisphere: string | null;
}

const twoDigits = (value: number): string => String(value).padStart(2, '0');

const toDegreesMinutesSeconds = (
	value: number,
	positiveHemisphere: string,
	negativeHemisphere: string,
): string => {
	const hemisphere = value < 0 ? negativeHemisphere : positiveHemisphere;
	const totalTenths = Math.round(
		Math.abs(value) * SECONDS_PER_DEGREE * TENTHS_PER_SECOND,
	);
	const tenths = totalTenths % TENTHS_PER_SECOND;
	const totalSeconds = Math.floor(totalTenths / TENTHS_PER_SECOND);
	const seconds = totalSeconds % SECONDS_PER_MINUTE;
	const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
	const minutes = totalMinutes % MINUTES_PER_DEGREE;
	const degrees = Math.floor(totalMinutes / MINUTES_PER_DEGREE);

	return `${degrees}°${twoDigits(minutes)}'${twoDigits(seconds)}.${tenths}" ${hemisphere}`;
};

export const formatCoordinates = (coordinates: Coordinates): string =>
	[
		toDegreesMinutesSeconds(coordinates.latitude, 'N', 'S'),
		toDegreesMinutesSeconds(coordinates.longitude, 'E', 'W'),
	].join(PAIR_SEPARATOR);

const toDecimalDegrees = (angle: Angle): number => {
	const magnitude =
		Math.abs(angle.degrees) +
		angle.minutes / MINUTES_PER_DEGREE +
		angle.seconds / SECONDS_PER_DEGREE;
	const isNegative = angle.hemisphere
		? NEGATIVE_HEMISPHERES.includes(angle.hemisphere)
		: angle.degrees < 0;

	return isNegative ? -magnitude : magnitude;
};

const hasValidMinutesAndSeconds = (angle: Angle): boolean =>
	angle.minutes < MINUTES_PER_DEGREE && angle.seconds < SECONDS_PER_MINUTE;

const contradictsItsHemisphere = (angle: Angle): boolean =>
	angle.hemisphere !== null && angle.degrees < 0;

const isLatitudeHemisphere = (angle: Angle): boolean | null =>
	angle.hemisphere === null
		? null
		: LATITUDE_HEMISPHERES.includes(angle.hemisphere);

const readAngles = (match: RegExpExecArray): Angle[] =>
	[0, CAPTURES_PER_ANGLE].map((offset) => ({
		degrees: Number(match[offset + 1]),
		minutes: Number(match[offset + 2] ?? 0),
		seconds: Number(match[offset + 3] ?? 0),
		hemisphere: match[offset + 4]?.toUpperCase() ?? null,
	}));

const isInRange = ({ latitude, longitude }: Coordinates): boolean =>
	Math.abs(latitude) <= MAX_LATITUDE && Math.abs(longitude) <= MAX_LONGITUDE;

export const parseCoordinates = (
	text: string | null | undefined,
): Coordinates | null => {
	const match = COORDINATE_PAIR.exec(text ?? '');
	if (!match) {
		return null;
	}

	const angles = readAngles(match);
	if (!angles.every(hasValidMinutesAndSeconds)) {
		return null;
	}
	if (angles.some(contradictsItsHemisphere)) {
		return null;
	}

	const [firstIsLatitude, secondIsLatitude] = angles.map(isLatitudeHemisphere);
	const namesTheSameAxis =
		firstIsLatitude !== null &&
		secondIsLatitude !== null &&
		firstIsLatitude === secondIsLatitude;
	if (namesTheSameAxis) {
		return null;
	}

	const isLongitudeFirst =
		firstIsLatitude === false || secondIsLatitude === true;
	const [latitude, longitude] = (
		isLongitudeFirst ? [angles[1], angles[0]] : angles
	).map(toDecimalDegrees);

	return isInRange({ latitude, longitude }) ? { latitude, longitude } : null;
};

export const coordinatesFromLocation = (
	location: LocnVOData | null | undefined,
): Coordinates | null => {
	const hasLatitude = location?.latitude != null && location.latitude !== '';
	const hasLongitude = location?.longitude != null && location.longitude !== '';
	if (!hasLatitude || !hasLongitude) {
		return null;
	}

	const latitude = Number(location.latitude);
	const longitude = Number(location.longitude);
	if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
		return null;
	}

	return { latitude, longitude };
};
