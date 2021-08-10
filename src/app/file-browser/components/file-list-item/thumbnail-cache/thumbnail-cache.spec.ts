import {ThumbnailCache, FolderThumbData} from './thumbnail-cache';
import {StorageService} from '@shared/services/storage/storage.service';
import {FolderVO} from '@models';
import {FolderContentsType} from '@fileBrowser/components/file-list-item/file-list-item.component';

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
  it('should return empty string tuple for uncached thumbnail', () => {
    const thumbs = cache.getThumbnail(folder);
    expect(thumbs).toBe(['', '']);
  });
  it('should be able to set and get thumbnail', () => {
    cache.saveThumbnail(folder, folderThumbData);
    const [thumb200, thumb500] = cache.getThumbnail(folder);
    expect(thumb200).toBe(folderThumbData.folderThumb200);
    expect(thumb500).toBe(folderThumbData.folderThumb500);
  });
  it('should be able to test if thumbnail is cached', () => {
    expect(cache.hasThumbnail(folder)).toBeFalse();
    cache.saveThumbnail(folder, folderThumbData);
    expect(cache.hasThumbnail(folder)).toBeTrue();
  });
  it('should use session storage to get this data', () => {
    cache.saveThumbnail(folder, folderThumbData);
    const cache2 = new ThumbnailCache(storage);
    const [thumb200, thumb500] = cache2.getThumbnail(folder);
    expect(thumb200).toBe(folderThumbData.folderThumb200);
    expect(thumb500).toBe(folderThumbData.folderThumb500);
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
      const [thumb200, thumb500] = cache.getThumbnail(folder);
      expect(thumb200).toBe('icon');
      expect(thumb500).toBe(icon);
    }
  });
  it('should be able to deal with and fix malformed session storage', () => {
    storage.session.set('folderThumbnailCache', 'potato');
    cache = new ThumbnailCache(storage);
    expect(cache.hasThumbnail(folder)).toBeFalse();

    storage.session.set('folderThumbnailCache', [[1234, 'potato']]);
    cache = new ThumbnailCache(storage);
    let thumbz = cache.getThumbnail(folder);
    expect(Array.isArray(thumbz)).toBeTrue();
    expect(thumbz.length).toBe(2);
    expect(storage.session.get('folderThumbnailCache').length).toBe(0);

    storage.session.set('folderThumbnailCache', [[1234, ['potato']]]);
    cache = new ThumbnailCache(storage);
    thumbz = cache.getThumbnail(folder);
    expect(Array.isArray(thumbz)).toBeTrue();
    expect(thumbz.length).toBe(2);
    expect(storage.session.get('folderThumbnailCache').length).toBe(0);

    storage.session.set('folderThumbnailCache', [[1234, [3.141, {}]]]);
    cache = new ThumbnailCache(storage);
    thumbz = cache.getThumbnail(folder);
    expect(thumbz[0].length).not.toBeNull();
    expect(thumbz[1].length).not.toBeNull();
  });
});
