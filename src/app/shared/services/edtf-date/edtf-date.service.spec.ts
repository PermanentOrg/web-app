import {
	EdtfDateService,
	EdtfDateModel,
	Meridian,
	DateQualifier,
} from './edtf-date.service';

function getEdtfObject(service: EdtfDateService): EdtfDateModel {
	return service.edtfObject;
}

describe('EdtfDateService', () => {
	it('should be created', () => {
		const service = new EdtfDateService('1985-05');

		expect(service).toBeTruthy();
	});

	describe('parseEdtfDate', () => {
		it('should parse year only', () => {
			const service = new EdtfDateService('1985');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result).toBeTruthy();
			expect(result.date).toEqual({
				year: '1985',
				month: '',
				day: '',
			});

			expect(result.time).toBeUndefined();
		});

		it('should parse year-month', () => {
			const service = new EdtfDateService('1985-05');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.date).toEqual({
				year: '1985',
				month: '05',
				day: '',
			});
		});

		it('should parse full date', () => {
			const service = new EdtfDateService('1985-05-20');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.date).toEqual({
				year: '1985',
				month: '05',
				day: '20',
			});
		});

		it('should parse date with time and convert to 12h format', () => {
			const service = new EdtfDateService('1985-05-20T14:30:45');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.date).toEqual({
				year: '1985',
				month: '05',
				day: '20',
			});

			expect(result.time).toEqual({
				hours: '02',
				minutes: '30',
				seconds: '45',
				amPm: Meridian.PM,
			});
		});

		it('should parse midnight as 12 AM', () => {
			const service = new EdtfDateService('1985-05-20T00:00:00');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.time!.hours).toBe('12');
			expect(result.time!.amPm).toBe(Meridian.AM);
		});

		it('should parse noon as 12 PM', () => {
			const service = new EdtfDateService('1985-05-20T12:00:00');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.time!.hours).toBe('12');
			expect(result.time!.amPm).toBe(Meridian.PM);
		});

		it('should extract timezone from offset', () => {
			const service = new EdtfDateService('1985-05-20T14:30:00-05:00');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.timezone!.timezoneOffset).toBe('GMT-05:00');
			expect(result.timezone!.timezoneName).toBe('EST');
		});

		it('should extract positive timezone offset', () => {
			const service = new EdtfDateService('1985-05-20T14:30:00+05:30');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.timezone!.timezoneOffset).toBe('GMT+05:30');
			expect(result.timezone!.timezoneName).toBe('IST');
		});

		it('should extract UTC timezone', () => {
			const service = new EdtfDateService('1985-05-20T14:30:00Z');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.timezone!.timezoneOffset).toBe('GMT+00:00');
			expect(result.timezone!.timezoneName).toBe('GMT');
		});

		it('should detect approximate qualifier', () => {
			const service = new EdtfDateService('1985-05~');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.qualifiers).toBeTruthy();
			expect(result.qualifiers!.get(DateQualifier.Approximate)).toBeTrue();
			expect(result.qualifiers!.has(DateQualifier.Uncertain)).toBeFalse();
		});

		it('should detect uncertain qualifier', () => {
			const service = new EdtfDateService('1985-05?');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.qualifiers).toBeTruthy();
			expect(result.qualifiers!.get(DateQualifier.Uncertain)).toBeTrue();
		});

		it('should detect both approximate and uncertain from %', () => {
			const service = new EdtfDateService('1985-05%');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.qualifiers).toBeTruthy();
			expect(result.qualifiers!.get(DateQualifier.Approximate)).toBeTrue();
			expect(result.qualifiers!.get(DateQualifier.Uncertain)).toBeTrue();
		});

		it('should not set qualifiers when none present', () => {
			const service = new EdtfDateService('1985-05');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.qualifiers).toBeUndefined();
		});

		it('should keep empty values for empty string', () => {
			const service = new EdtfDateService('');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.date).toEqual({ year: '', month: '', day: '' });
			expect(result.time).toBeUndefined();
			expect(result.timezone).toBeUndefined();
		});

		it('should keep empty values for invalid input', () => {
			const service = new EdtfDateService('not-a-date');
			service.parseEdtfDate();
			const result = getEdtfObject(service);

			expect(result.date).toEqual({ year: '', month: '', day: '' });
			expect(result.time).toBeUndefined();
			expect(result.timezone).toBeUndefined();
		});
	});

	describe('ngOnDestroy', () => {
		it('should clear edtfString and edtfObject', () => {
			const service = new EdtfDateService('1985-05');
			service.parseEdtfDate();
			service.ngOnDestroy();

			const result = getEdtfObject(service);

			expect(result.date).toEqual({ year: '', month: '', day: '' });
			expect(result.time).toBeUndefined();
			expect(result.timezone).toBeUndefined();
		});
	});
});
