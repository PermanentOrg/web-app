import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { ArchiveVO, FolderVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { RootFolderService } from '@shared/services/root-folder/root-folder.service';
import { AccountService } from './account.service';

describe('AccountService root folder', () => {
	let accountService: AccountService;
	let loadRootFolderSpy: jasmine.Spy;
	const privateRoot = new FolderVO({ folderId: 48586, type: 'private-root' });
	const publicRoot = new FolderVO({ folderId: 48587, type: 'public-root' });
	const stelaRootFolder = new FolderVO({
		folderId: 48584,
		type: 'root',
		ChildItemVOs: [
			new FolderVO({ folderId: 48585, type: 'app-root' }),
			privateRoot,
			publicRoot,
		],
	});

	beforeEach(() => {
		TestBed.configureTestingModule(cloneDeep(Testing.BASE_TEST_CONFIG));
		loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(stelaRootFolder);
		accountService = TestBed.inject(AccountService);
		accountService.clearRootFolder();
		loadRootFolderSpy.calls.reset();
	});

	it('should refresh the root through the root folder loader for the current archive', async () => {
		const currentArchive = new ArchiveVO({ archiveId: 2977 });
		accountService.setArchive(currentArchive);

		await accountService.refreshRoot();

		expect(loadRootFolderSpy).toHaveBeenCalledWith(currentArchive);
		expect(accountService.getRootFolder()).toBe(stelaRootFolder);
	});

	it('should load the new archive root after switching archives', async () => {
		const api = TestBed.inject(ApiService);
		spyOn(api.archive, 'change').and.resolveTo(
			new ArchiveResponse({
				isSuccessful: true,
				Results: [
					{
						data: [{ ArchiveVO: { archiveId: 3227, archiveNbr: '01on-0000' } }],
					},
				],
			}),
		);

		await accountService.changeArchive(
			new ArchiveVO({ archiveId: 3227, archiveNbr: '01on-0000' }),
		);

		const requestedArchive = loadRootFolderSpy.calls.mostRecent()
			.args[0] as ArchiveVO;

		expect(requestedArchive.archiveId).toBe(3227);
		expect(accountService.getRootFolder()).toBe(stelaRootFolder);
	});

	it('should keep the root of the archive switched to last when an earlier switch loads slower', async () => {
		const api = TestBed.inject(ApiService);
		spyOn(api.archive, 'change').and.callFake(
			async (archive: ArchiveVO) =>
				new ArchiveResponse({
					isSuccessful: true,
					Results: [{ data: [{ ArchiveVO: archive }] }],
				}),
		);
		const firstArchiveRoot = new FolderVO({ folderId: 1, type: 'root' });
		const secondArchiveRoot = new FolderVO({ folderId: 2, type: 'root' });
		let resolveFirstArchiveRoot: (root: FolderVO) => void;
		loadRootFolderSpy.and.callFake(async (archive: ArchiveVO) =>
			archive.archiveId === 1
				? await new Promise<FolderVO>((resolve) => {
						resolveFirstArchiveRoot = resolve;
					})
				: secondArchiveRoot,
		);
		const archiveChangeSpy = spyOn(accountService.archiveChange, 'emit');

		const firstSwitch = accountService.changeArchive(
			new ArchiveVO({ archiveId: 1 }),
		);
		await accountService.changeArchive(new ArchiveVO({ archiveId: 2 }));
		resolveFirstArchiveRoot(firstArchiveRoot);
		await firstSwitch;

		expect(accountService.getArchive().archiveId).toBe(2);
		expect(accountService.getRootFolder()).toBe(secondArchiveRoot);
		expect(archiveChangeSpy).toHaveBeenCalledTimes(1);
	});

	it('should drop a refreshed root when the archive changed while it loaded', async () => {
		accountService.setArchive(new ArchiveVO({ archiveId: 1 }));
		let resolveRefreshedRoot: (root: FolderVO) => void;
		loadRootFolderSpy.and.returnValue(
			new Promise<FolderVO>((resolve) => {
				resolveRefreshedRoot = resolve;
			}),
		);

		const refresh = accountService.refreshRoot();
		accountService.setArchive(new ArchiveVO({ archiveId: 2 }));
		resolveRefreshedRoot(stelaRootFolder);
		await refresh;

		expect(accountService.getRootFolder()).toBeUndefined();
	});

	it('should find the workspace roots in a root loaded from Stela', () => {
		accountService.setRootFolder(stelaRootFolder);

		expect(accountService.getPrivateRoot()).toBe(privateRoot);
		expect(accountService.getPublicRoot()).toBe(publicRoot);
	});
});
