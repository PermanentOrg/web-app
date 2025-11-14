import { FolderVO } from '@models/index';
import { PermanentFilesystem } from './permanent-filesystem';
import { FakeFilesystemApi } from './mocks/fake-filesystem-api';
import { FolderCache } from './folder-cache';

describe('Permanent Filesystem (Folder Caching)', () => {
	let fs: PermanentFilesystem;
	let api: FakeFilesystemApi;
	let cache: FolderCache;

	beforeEach(() => {
		api = new FakeFilesystemApi();
		cache = new FolderCache();
		fs = new PermanentFilesystem(api, cache);
	});

	it('should exist', () => {
		expect(fs).toBeTruthy();
	});

	it('does not need to have an external FolderCache provided', () => {
		fs = new PermanentFilesystem(api);

		expect(fs).toBeTruthy();
	});

	it('should be able to fetch the filesystem root', async () => {
		const root = await fs.getArchiveRoot({ archiveId: 0 });

		expect(root).toBeTruthy();
		expect(api.methodWasCalled('getRoot')).toBeTrue();
	});

	it('should be able to fetch an arbitrary folder', async () => {
		const folder = await fs.getFolder({ folder_linkId: 0 });

		expect(folder).toBeTruthy();
		expect(api.methodWasCalled('navigate')).toBeTrue();
	});

	it('should be able to fetch an arbitrary record', async () => {
		const record = await fs.getRecord({ recordId: 0 });

		expect(record).toBeTruthy();
		expect(api.methodWasCalled('recordGet')).toBeTrue();
	});

	it('should save fetched values to the cache', async () => {
		await fs.getFolder({ folderId: 0 });

		expect(cache.getFolder({ folderId: 0 })).not.toBeNull();
	});

	it('should use the cached version of a folder immediately', async () => {
		api.addFolder(new FolderVO({ folderId: 0, displayName: 'Updated Value' }));
		cache.saveFolder(
			new FolderVO({ folderId: 0, displayName: 'Cached Value' }),
		);
		// Copy the initial value returned from the cache so it will never be modified
		const folder = Object.assign({}, await fs.getFolder({ folderId: 0 }));

		expect(folder.displayName).toBe('Cached Value');
	});

	it('should still fetch and update a folder after retrieving the cached version', async () => {
		cache.saveFolder(
			new FolderVO({ folderId: 0, displayName: 'Cached Value' }),
		);
		// Simulate a backend change happening in another window/tab/client/etc.
		api.addFolder(new FolderVO({ folderId: 0, displayName: 'Updated Value' }));
		const folder = await fs.getFolder({ folderId: 0 });
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 0);
		});

		expect(folder.displayName).toBe('Updated Value');
	});
});
