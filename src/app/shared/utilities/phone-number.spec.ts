import {
	storedPhoneNumberNeedsCountryWarning,
	typedPhoneNumberNeedsCountryWarning,
} from './phone-number';

describe('storedPhoneNumberNeedsCountryWarning', () => {
	it('stays quiet for a number however it is punctuated', () => {
		expect(
			storedPhoneNumberNeedsCountryWarning('(202) 555 - 0147'),
		).toBeFalse();

		expect(storedPhoneNumberNeedsCountryWarning('2025550147')).toBeFalse();
		expect(storedPhoneNumberNeedsCountryWarning('202.555.0147')).toBeFalse();
		expect(
			storedPhoneNumberNeedsCountryWarning('  202 555 0147  '),
		).toBeFalse();
	});

	it('stays quiet however the country code is dialled', () => {
		expect(
			storedPhoneNumberNeedsCountryWarning('+1 (202) 555-0147'),
		).toBeFalse();

		expect(storedPhoneNumberNeedsCountryWarning('1-202-555-0147')).toBeFalse();
		expect(
			storedPhoneNumberNeedsCountryWarning('001 202 555 0147'),
		).toBeFalse();

		expect(
			storedPhoneNumberNeedsCountryWarning('011 1 202 555 0147'),
		).toBeFalse();
	});

	it('stays quiet for a Canadian number', () => {
		expect(storedPhoneNumberNeedsCountryWarning('+1 416 555 0147')).toBeFalse();
		expect(storedPhoneNumberNeedsCountryWarning('604 555 0147')).toBeFalse();
	});

	it('stays quiet for a US territory, which is a US number', () => {
		expect(storedPhoneNumberNeedsCountryWarning('787 555 0147')).toBeFalse(); // Puerto Rico
		expect(storedPhoneNumberNeedsCountryWarning('939 555 0147')).toBeFalse(); // Puerto Rico
		expect(storedPhoneNumberNeedsCountryWarning('340 555 0147')).toBeFalse(); // US Virgin Islands
		expect(storedPhoneNumberNeedsCountryWarning('671 555 0147')).toBeFalse(); // Guam
		expect(storedPhoneNumberNeedsCountryWarning('684 555 0147')).toBeFalse(); // American Samoa
		expect(storedPhoneNumberNeedsCountryWarning('670 555 0147')).toBeFalse(); // N. Mariana Islands
	});

	it('stays quiet for an empty field, since clearing the number is allowed', () => {
		expect(storedPhoneNumberNeedsCountryWarning('')).toBeFalse();
		expect(storedPhoneNumberNeedsCountryWarning('   ')).toBeFalse();
		expect(storedPhoneNumberNeedsCountryWarning(null)).toBeFalse();
		expect(storedPhoneNumberNeedsCountryWarning(undefined)).toBeFalse();
	});

	it('warns about numbers from outside the numbering plan', () => {
		expect(storedPhoneNumberNeedsCountryWarning('+44 20 7946 0958')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('+40 721 234 567')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('+49 151 12345678')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('+61 2 9374 4000')).toBeTrue();
		expect(
			storedPhoneNumberNeedsCountryWarning('+86 138 0013 8000'),
		).toBeTrue();

		expect(storedPhoneNumberNeedsCountryWarning('+91 98765 43210')).toBeTrue();
		expect(
			storedPhoneNumberNeedsCountryWarning('0044 20 7946 0958'),
		).toBeTrue();
	});

	it('warns about the other +1 countries, which dial exactly like a US number', () => {
		expect(storedPhoneNumberNeedsCountryWarning('+1 876 555 0123')).toBeTrue(); // Jamaica
		expect(storedPhoneNumberNeedsCountryWarning('+1 658 555 0123')).toBeTrue(); // Jamaica
		expect(storedPhoneNumberNeedsCountryWarning('242 555 0123')).toBeTrue(); // The Bahamas
		expect(storedPhoneNumberNeedsCountryWarning('246 555 0123')).toBeTrue(); // Barbados
		expect(storedPhoneNumberNeedsCountryWarning('441 555 0123')).toBeTrue(); // Bermuda
		expect(storedPhoneNumberNeedsCountryWarning('721 555 0123')).toBeTrue(); // Sint Maarten
		expect(storedPhoneNumberNeedsCountryWarning('809 555 0123')).toBeTrue(); // Dominican Rep.
		expect(storedPhoneNumberNeedsCountryWarning('829 555 0123')).toBeTrue(); // Dominican Rep.
		expect(storedPhoneNumberNeedsCountryWarning('849 555 0123')).toBeTrue(); // Dominican Rep.
		expect(storedPhoneNumberNeedsCountryWarning('868 555 0123')).toBeTrue(); // Trinidad & Tobago
	});

	it('warns about a national trunk prefix that is not a country code', () => {
		expect(storedPhoneNumberNeedsCountryWarning('0721 234 567')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('020 7946 0958')).toBeTrue();
	});

	it('warns about the wrong quantity of digits, however it got stored', () => {
		expect(storedPhoneNumberNeedsCountryWarning('555 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('202 555 014')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('202 555 01478')).toBeTrue();
		expect(
			storedPhoneNumberNeedsCountryWarning('(202) 555-0147 ext 22'),
		).toBeTrue();
	});

	it('warns about an area code the plan never assigns', () => {
		expect(storedPhoneNumberNeedsCountryWarning('102 555 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('002 555 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('911 555 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('411 555 0147')).toBeTrue();
	});

	it('warns about an exchange code the plan never assigns', () => {
		expect(storedPhoneNumberNeedsCountryWarning('202 155 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('202 055 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('202 411 0147')).toBeTrue();
		expect(storedPhoneNumberNeedsCountryWarning('555 123 4567')).toBeTrue();
	});

	it('warns about text that holds no number at all', () => {
		expect(storedPhoneNumberNeedsCountryWarning('call me')).toBeTrue();
	});
});

describe('typedPhoneNumberNeedsCountryWarning', () => {
	const everyPrefixOf = (wholeNumber: string): string[] =>
		Array.from(wholeNumber, (_, index) => wholeNumber.slice(0, index + 1));

	[
		'(202) 555-0147',
		'+1 (202) 555-0147',
		'1-202-555-0147',
		'001 202 555 0147',
		'011 1 202 555 0147',
		'416 555 0147',
		'787 555 0147',
	].forEach((wholeNumber) => {
		it(`stays quiet at every keystroke of ${wholeNumber}`, () => {
			everyPrefixOf(wholeNumber).forEach((partial) => {
				expect(typedPhoneNumberNeedsCountryWarning(partial))
					.withContext(partial)
					.toBeFalse();
			});
		});
	});

	it('warns as soon as an international number is long enough to judge', () => {
		expect(typedPhoneNumberNeedsCountryWarning('+44 20 7946')).toBeFalse();
		expect(typedPhoneNumberNeedsCountryWarning('+44 20 7946 09')).toBeTrue();
		expect(typedPhoneNumberNeedsCountryWarning('+44 20 7946 0958')).toBeTrue();
		expect(typedPhoneNumberNeedsCountryWarning('+40 721 234 567')).toBeTrue();
	});

	it('warns as soon as a whole-length number names another +1 country', () => {
		expect(typedPhoneNumberNeedsCountryWarning('876 555 012')).toBeFalse();
		expect(typedPhoneNumberNeedsCountryWarning('876 555 0123')).toBeTrue();
	});

	it('warns about a whole-length number with an unusable code', () => {
		expect(typedPhoneNumberNeedsCountryWarning('202 155 0147')).toBeTrue();
		expect(typedPhoneNumberNeedsCountryWarning('020 7946 0958')).toBeTrue();
	});

	it('holds back on ten digits that could still be growing a country code', () => {
		expect(typedPhoneNumberNeedsCountryWarning('102 555 0147')).toBeFalse();
	});

	it('stays quiet for an empty field', () => {
		expect(typedPhoneNumberNeedsCountryWarning('')).toBeFalse();
		expect(typedPhoneNumberNeedsCountryWarning(null)).toBeFalse();
		expect(typedPhoneNumberNeedsCountryWarning(undefined)).toBeFalse();
	});
});
