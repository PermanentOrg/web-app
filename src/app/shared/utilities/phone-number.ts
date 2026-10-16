import { phone } from 'phone';

const NON_DIGITS = /\D/g;
const NANP_COUNTRY_CODE = '1';
const NANP_SUBSCRIBER_DIGITS = 10;
const INTERNATIONAL_CALL_PREFIXES = ['011', '00'];

const US_AND_CANADA_REGIONS = new Set([
	'US',
	'CA',
	'PR', // Puerto Rico
	'VI', // US Virgin Islands
	'GU', // Guam
	'AS', // American Samoa
	'MP', // Northern Mariana Islands
]);

export const UNSUPPORTED_PHONE_COUNTRY_NOTICE =
	'Permanent can only send verification codes to US and Canada numbers.';

const onlyDigits = (text: string | null | undefined): string =>
	(text ?? '').replace(NON_DIGITS, '');

const internationalCallPrefixOf = (digits: string): string =>
	INTERNATIONAL_CALL_PREFIXES.find((candidate) =>
		digits.startsWith(candidate),
	) ?? '';

const countryCodeOf = (digits: string): string =>
	digits.startsWith(NANP_COUNTRY_CODE) ? NANP_COUNTRY_CODE : '';

const startsWithPlusSign = (text: string | null | undefined): boolean =>
	(text ?? '').trim().startsWith('+');

/**
 * Rewrites the number the way it would be dialled from abroad (`+` and the
 * country code), treating a number written without a country code as a
 * US or Canada one.
 */
const asInternationalNumber = (text: string | null | undefined): string => {
	const digits = onlyDigits(text);

	if (startsWithPlusSign(text)) {
		return `+${digits}`;
	}

	const internationalCallPrefix = internationalCallPrefixOf(digits);
	if (internationalCallPrefix) {
		return `+${digits.slice(internationalCallPrefix.length)}`;
	}

	const hasCountryCode =
		digits.startsWith(NANP_COUNTRY_CODE) &&
		digits.length === NANP_SUBSCRIBER_DIGITS + NANP_COUNTRY_CODE.length;

	return hasCountryCode ? `+${digits}` : `+${NANP_COUNTRY_CODE}${digits}`;
};

const digitsNeededForAWholeNumber = (digits: string): number => {
	const internationalCallPrefix = internationalCallPrefixOf(digits);
	const countryCode = countryCodeOf(
		digits.slice(internationalCallPrefix.length),
	);

	return (
		NANP_SUBSCRIBER_DIGITS + internationalCallPrefix.length + countryCode.length
	);
};

const namesAUsOrCanadaNumber = (text: string | null | undefined): boolean => {
	const recognisedNumber = phone(asInternationalNumber(text), {
		strictDetection: true,
	});

	return (
		recognisedNumber.isValid &&
		US_AND_CANADA_REGIONS.has(recognisedNumber.countryIso2)
	);
};

const isBlank = (text: string | null | undefined): boolean =>
	(text ?? '').trim() === '';

export const storedPhoneNumberNeedsCountryWarning = (
	text: string | null | undefined,
): boolean => !isBlank(text) && !namesAUsOrCanadaNumber(text);

export const typedPhoneNumberNeedsCountryWarning = (
	text: string | null | undefined,
): boolean => {
	const digits = onlyDigits(text);

	return (
		digits.length >= digitsNeededForAWholeNumber(digits) &&
		!namesAUsOrCanadaNumber(text)
	);
};
