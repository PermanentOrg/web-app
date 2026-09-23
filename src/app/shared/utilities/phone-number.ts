const NON_DIGITS = /\D/g;
const NANP_COUNTRY_CODE = '1';
const NANP_SUBSCRIBER_DIGITS = 10;
const INTERNATIONAL_CALL_PREFIXES = ['011', '00'];
const NANP_NUMBER = /^([2-9]\d\d)([2-9]\d\d)\d{4}$/;
const SERVICE_CODE = /^\d11$/;

const AREA_CODES_OUTSIDE_US_AND_CANADA = new Set([
	'242', // The Bahamas
	'246', // Barbados
	'264', // Anguilla
	'268', // Antigua and Barbuda
	'284', // British Virgin Islands
	'345', // Cayman Islands
	'441', // Bermuda
	'473', // Grenada
	'649', // Turks and Caicos Islands
	'658', // Jamaica
	'664', // Montserrat
	'721', // Sint Maarten
	'758', // Saint Lucia
	'767', // Dominica
	'784', // Saint Vincent and the Grenadines
	'809', // Dominican Republic
	'829', // Dominican Republic
	'849', // Dominican Republic
	'868', // Trinidad and Tobago
	'869', // Saint Kitts and Nevis
	'876', // Jamaica
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

const withoutDiallingPrefixes = (digits: string): string => {
	const afterInternationalPrefix = digits.slice(
		internationalCallPrefixOf(digits).length,
	);
	const hasCountryCode =
		afterInternationalPrefix.startsWith(NANP_COUNTRY_CODE) &&
		afterInternationalPrefix.length ===
			NANP_SUBSCRIBER_DIGITS + NANP_COUNTRY_CODE.length;

	return hasCountryCode
		? afterInternationalPrefix.slice(NANP_COUNTRY_CODE.length)
		: afterInternationalPrefix;
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
	const wholeNumber = NANP_NUMBER.exec(
		withoutDiallingPrefixes(onlyDigits(text)),
	);

	if (!wholeNumber) {
		return false;
	}

	const [, areaCode, exchangeCode] = wholeNumber;

	return (
		!SERVICE_CODE.test(areaCode) &&
		!SERVICE_CODE.test(exchangeCode) &&
		!AREA_CODES_OUTSIDE_US_AND_CANADA.has(areaCode)
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
