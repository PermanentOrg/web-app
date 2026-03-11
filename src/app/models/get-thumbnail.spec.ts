import { GetThumbnail, GetBanner } from './get-thumbnail';
import { FolderVO, RecordVO } from '.';

describe('GetThumbnail', () => {
	it('returns undefined if no thumbnails are defined', () => {
		const record = new RecordVO({});

		expect(GetThumbnail(record)).toBeUndefined();
	});

	it('should prefer thumbnail256 when available', () => {
		const record = new RecordVO({
			thumbURL200: 'https://example.com/200',
			thumbnail256: 'https://example.com/256',
			thumbURL500: 'https://example.com/500',
		});

		expect(GetThumbnail(record)).toBe('https://example.com/256');
	});

	it('should fall back to thumbURL500 when thumbnail256 is not available', () => {
		const record = new RecordVO({
			thumbURL200: 'https://example.com/200',
			thumbURL500: 'https://example.com/500',
		});

		expect(GetThumbnail(record)).toBe('https://example.com/500');
	});

	it('should fall back to thumbURL200 when neither thumbnail256 nor thumbURL500 is available', () => {
		const record = new RecordVO({
			thumbURL200: 'https://example.com/200',
			thumbURL1000: 'https://example.com/1000',
		});

		expect(GetThumbnail(record)).toBe('https://example.com/200');
	});

	it('should return the only available thumbnail', () => {
		const record = new RecordVO({ thumbURL2000: 'https://example.com/2000' });

		expect(GetThumbnail(record)).toBe('https://example.com/2000');
	});

	it('can take in a folder as well', () => {
		const folder = new FolderVO({
			thumbnail256: 'https://example.com/256',
			thumbURL500: 'https://example.com/500',
		});

		expect(GetThumbnail(folder)).toBe('https://example.com/256');
	});

	it('should follow full preference chain: 256 > 500 > 200 > 1000 > 2000', () => {
		expect(
			GetThumbnail({
				thumbURL1000: 'https://example.com/1000',
				thumbURL2000: 'https://example.com/2000',
			}),
		).toBe('https://example.com/1000');

		expect(GetThumbnail({ thumbURL2000: 'https://example.com/2000' })).toBe(
			'https://example.com/2000',
		);
	});
});

describe('GetBanner', () => {
	it('returns undefined if no banner thumbnails are defined', () => {
		const record = new RecordVO({});

		expect(GetBanner(record)).toBeUndefined();
	});

	it('should prefer thumbURL2000 when available', () => {
		const record = {
			thumbURL200: 'https://example.com/200',
			thumbnail256: 'https://example.com/256',
			thumbURL500: 'https://example.com/500',
			thumbURL1000: 'https://example.com/1000',
			thumbURL2000: 'https://example.com/2000',
		};

		expect(GetBanner(record)).toBe('https://example.com/2000');
	});

	it('should fall back to thumbURL1000 when thumbURL2000 is not available', () => {
		const record = {
			thumbURL500: 'https://example.com/500',
			thumbURL1000: 'https://example.com/1000',
		};

		expect(GetBanner(record)).toBe('https://example.com/1000');
	});

	it('should fall back to thumbURL500 when larger sizes are not available', () => {
		const record = {
			thumbnail256: 'https://example.com/256',
			thumbURL500: 'https://example.com/500',
		};

		expect(GetBanner(record)).toBe('https://example.com/500');
	});

	it('should fall back to thumbnail256 as last resort', () => {
		const record = {
			thumbnail256: 'https://example.com/256',
		};

		expect(GetBanner(record)).toBe('https://example.com/256');
	});

	it('can take in a FolderVO', () => {
		const folder = new FolderVO({
			thumbURL2000: 'https://example.com/2000',
		});

		expect(GetBanner(folder)).toBe('https://example.com/2000');
	});
});
