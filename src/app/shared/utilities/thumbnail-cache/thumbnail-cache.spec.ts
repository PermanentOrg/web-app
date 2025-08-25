import { StorageService } from '@shared/services/storage/storage.service';
import { FolderVO } from '@models';
import { FolderContentsType } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { ThumbnailCache, FolderThumbData } from './thumbnail-cache';

describe('ThumbnailCache', () => {
	let cache: ThumbnailCache;
	let storage: StorageService;
	let folder: FolderVO;
	let folderThumbData: FolderThumbData;
	beforeEach(() => {
		storage = new StorageService();
		storage.local.setStoreInMemory(true);
		storage.session.setStoreInMemory(true);
		cache = new ThumbnailCache(storage);

		folder = new FolderVO({
			folder_linkId: 1234,
		});
		folderThumbData = {
			folderThumb200: '200URL',
			folderThumb500: '500URL?r=' + Math.random(),
			folderContentsType: FolderContentsType.NORMAL,
		};
	});

	it('should exist', () => {
		expect(cache).not.toBeNull();
	});

	it('should return an empty FolderThumbData object for uncached thumbnail', () => {
		const thumbs = cache.getThumbnail(folder);

		expect(thumbs.folderThumb200).toBeDefined();
		expect(thumbs.folderThumb500).toBeDefined();
		expect(thumbs.folderContentsType).toBe(
			FolderContentsType.BROKEN_THUMBNAILS,
		);
	});

	it('should be able to set and get thumbnail', () => {
		cache.saveThumbnail(folder, folderThumbData);
		const { folderThumb200, folderThumb500 } = cache.getThumbnail(folder);

		expect(folderThumb200).toBe(folderThumbData.folderThumb200);
		expect(folderThumb500).toBe(folderThumbData.folderThumb500);
	});

	it('should be able to test if thumbnail is cached', () => {
		expect(cache.hasThumbnail(folder)).toBeFalse();
		cache.saveThumbnail(folder, folderThumbData);

		expect(cache.hasThumbnail(folder)).toBeTrue();
	});

	it('should use session storage to get this data', () => {
		cache.saveThumbnail(folder, folderThumbData);
		const cache2 = new ThumbnailCache(storage);
		const { folderThumb200, folderThumb500 } = cache2.getThumbnail(folder);

		expect(folderThumb200).toBe(folderThumbData.folderThumb200);
		expect(folderThumb500).toBe(folderThumbData.folderThumb500);
	});

	it('should store icon data instead if neccessary', () => {
		const iconTypes = [
			FolderContentsType.BROKEN_THUMBNAILS,
			FolderContentsType.EMPTY_FOLDER,
			FolderContentsType.MIXED_FILES,
			FolderContentsType.SUBFOLDERS,
		];
		for (const icon of iconTypes) {
			folderThumbData.folderContentsType = icon;
			folder.folder_linkId += 1;
			cache.saveThumbnail(folder, folderThumbData);
			const { folderThumb200, folderThumb500, folderContentsType } =
				cache.getThumbnail(folder);

			expect(folderThumb200).toBe('');
			expect(folderThumb500).toBe('');
			expect(folderContentsType).toBe(icon);
		}
	});

	it('should be able to clear the cache for a specific folder', () => {
		cache.invalidateFolder(1234);

		expect(cache.hasThumbnail(folder)).toBeFalse();
	});

	describe('malformed session storage', () => {
		it('handles completely invalid session storage value', () => {
			storage.session.set('folderThumbnailCache', 'potato');
			cache = new ThumbnailCache(storage);

			expect(cache.hasThumbnail(folder)).toBeFalse();
		});

		it('handles linking another value instead of a string tuple', () => {
			storage.session.set('folderThumbnailCache', [[1234, 'potato']]);
			cache = new ThumbnailCache(storage);
			const thumbz = cache.getThumbnail(folder);

			expect(thumbz.folderThumb200).toBe('');
			expect(thumbz.folderThumb500).toBe('');
			expect(thumbz.folderContentsType).toBe(
				FolderContentsType.BROKEN_THUMBNAILS,
			);

			expect(storage.session.get('folderThumbnailCache').length).toBe(0);
		});

		it('handles properly casting other values to string if a tuple is provided', () => {
			storage.session.set('folderThumbnailCache', [[1234, [3.141, {}]]]);
			cache = new ThumbnailCache(storage);
			const thumbz = cache.getThumbnail(folder);

			expect(thumbz.folderThumb200).toBe('3.141');
			expect(thumbz.folderThumb500).toBe('[object Object]');
			expect(thumbz.folderContentsType).toBe(FolderContentsType.NORMAL);
		});
	});
});
