import { FolderVO, RecordVO } from '@models';
import { getSlideshowImages } from './slideshow-util';

describe('getSlideshowImages', () => {
	it('keeps only image records, in order', () => {
		const imageOne = new RecordVO({ type: 'type.record.image' });
		const imageTwo = new RecordVO({ type: 'type.record.image' });
		const items = [
			new FolderVO({ type: 'type.folder.private' }),
			imageOne,
			new RecordVO({ type: 'type.record.video' }),
			new RecordVO({ type: 'type.record.document' }),
			imageTwo,
			new RecordVO({ type: 'type.record.audio' }),
		];

		expect(getSlideshowImages(items)).toEqual([imageOne, imageTwo]);
	});

	it('handles a folder with no images', () => {
		expect(
			getSlideshowImages([new RecordVO({ type: 'type.record.pdf' })]),
		).toEqual([]);
	});

	it('handles missing children', () => {
		expect(getSlideshowImages(undefined)).toEqual([]);
		expect(getSlideshowImages([])).toEqual([]);
	});
});
