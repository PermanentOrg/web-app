import { GetThumbnail } from './get-thumbnail';
import { FolderVO, RecordVO } from '.';

describe('GetThumbnail', () => {
	it('returns undefined if no thumbnails are defined', () => {
		const record = new RecordVO({});

		expect(GetThumbnail(record, 256)).toBeUndefined();
	});

	it('should return the thumbnail if only one is defined', () => {
		const record = new RecordVO({ thumbURL200: 'https://example.com' });

		expect(GetThumbnail(record, 1000)).toBe('https://example.com');
	});

	it('should return the thumbnail if the only one defined is not the minimum size', () => {
		const record = { thumbURL2000: 'https://example.com' };

		expect(GetThumbnail(record, Infinity)).toBe('https://example.com');
	});

	it('should return the correct thumbnail if two are defined', () => {
		const record = new RecordVO({
			thumbURL200: 'https://example.com/invalid',
			thumbURL500: 'https://example.com/correct',
		});

		expect(GetThumbnail(record, 300)).toBe('https://example.com/correct');
	});

	it('should identify the correct thumbnail if all are defined', () => {
		const record = new RecordVO({
			thumbURL200: 'https://example.com/invalid',
			thumbURL500: 'https://example.com/invalid',
			thumbURL1000: 'https://example.com/correct',
			thumbURL2000: 'https://example.com/invalid',
		});

		expect(GetThumbnail(record, 1000)).toBe('https://example.com/correct');
	});

	it('can take in a folder as well', () => {
		const folder = new FolderVO({
			thumbURL200: 'https://example.com/invalid',
			thumbURL500: 'https://example.com/invalid',
			thumbURL1000: 'https://example.com/correct',
			thumbURL2000: 'https://example.com/invalid',
		});

		expect(GetThumbnail(folder, 1000)).toBe('https://example.com/correct');
	});

	it('can handle a 256x256 thumbnail size', () => {
		expect(
			GetThumbnail(
				{
					thumbURL200: 'https://example.com/invalid',
					thumbnail256: 'https://example.com/correct',
				},
				225,
			),
		).toBe('https://example.com/correct');
	});

	it('should return the maximum size if a size bigger than all thumb sizes is requested', () => {
		expect(
			GetThumbnail(
				{
					thumbURL200: 'https://example.com/invalid',
					thumbURL2000: 'https://example.com/correct',
				},
				100000,
			),
		).toBe('https://example.com/correct');
	});
});
