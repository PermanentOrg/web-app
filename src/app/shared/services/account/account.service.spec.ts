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

	it('should find the workspace roots in a root loaded from Stela', () => {
		accountService.setRootFolder(stelaRootFolder);

		expect(accountService.getPrivateRoot()).toBe(privateRoot);
		expect(accountService.getPublicRoot()).toBe(publicRoot);
	});
});
