import { FolderVO } from '@models/index';
import { FolderCache } from './folder-cache';

describe('FolderCache', () => {
  let cache: FolderCache;
  beforeEach(() => {
    cache = new FolderCache();
  });

  it('should exist', () => {
    expect(cache).toBeTruthy();
  });

  it('should return null if a folder is not cached', () => {
    cache.saveFolder(new FolderVO({ folder_linkId: 10000 }));

    expect(cache.getFolder({ folder_linkId: 1 })).toBeNull();
  });

  it('should be able to save to the cache', () => {
    const folder = new FolderVO({ folder_linkId: 1 });
    cache.saveFolder(folder);

    expect(cache.getFolder({ folder_linkId: 1 })).toEqual(folder);
  });

  it('should be able to update an existing cache value', () => {
    const folder = new FolderVO({ folder_linkId: 1 });
    cache.saveFolder(folder);
    cache.saveFolder(
      new FolderVO({ folder_linkId: 1, displayName: 'Unit Test' })
    );

    expect(cache.getFolder({ folder_linkId: 1 }).displayName).toBe('Unit Test');
  });

  it('should not update a folder if its API value equals its cached value', () => {
    // This tests preventing unnecessary rerenders if no changes are found
    const folder = new FolderVO({ folder_linkId: 1 });
    const updateSpy = spyOn(folder, 'update').and.callThrough();
    cache.saveFolder(folder);
    cache.saveFolder(new FolderVO({ folder_linkId: 1 }));

    expect(updateSpy).not.toHaveBeenCalled();
  });

  describe('Folder Identifiers', () => {
    let folder: FolderVO;

    beforeEach(() => {
      folder = new FolderVO({
        folderId: 1,
        folder_linkId: 10,
        archiveNbr: '1234-test',
      });
      cache.saveFolder(folder);
    });

    it('can look up by FolderId', () => {
      expect(cache.getFolder({ folderId: 1 })).toEqual(folder);
    });

    it('can look up by folder_linkId', () => {
      expect(cache.getFolder({ folder_linkId: 10 })).toEqual(folder);
    });

    it('can look up by ArchiveNbr', () => {
      expect(cache.getFolder({ archiveNbr: '1234-test' })).toEqual(folder);
    });

    it('should prioritize folderId over folder_linkId', () => {
      expect(cache.getFolder({ folderId: 1, folder_linkId: Infinity })).toEqual(
        folder
      );
    });

    it('should prioritize folder_linkId over archiveNbr', () => {
      expect(
        cache.getFolder({ folder_linkId: 10, archiveNbr: 'No Match' })
      ).toEqual(folder);
    });
  });
});
