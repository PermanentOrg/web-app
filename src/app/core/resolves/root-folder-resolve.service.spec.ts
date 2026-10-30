import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';
import { AccountService } from '@shared/services/account/account.service';
import { RootFolderService } from '@shared/services/root-folder/root-folder.service';
import { ArchiveVO, FolderVO } from '@models/index';

describe('RootFolderResolveService', () => {
	let service: RootFolderResolveService;
	let accountService: AccountService;
	let loadRootFolderSpy: jasmine.Spy;
	const stelaRootFolder = new FolderVO({ folderId: 48584, type: 'root' });

	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		const providers = config.providers as any[];
		providers.push(RootFolderResolveService);
		TestBed.configureTestingModule(config);

		loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(stelaRootFolder);
		service = TestBed.inject(RootFolderResolveService);
		accountService = TestBed.inject(AccountService);
		accountService.clearRootFolder();
		loadRootFolderSpy.calls.reset();
	});

	async function resolveWithoutArchiveSwitch(): Promise<FolderVO> {
		return await service.resolve({ queryParams: {} } as any, {} as any);
	}

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should keep the root the account already has', async () => {
		const cachedRootFolder = new FolderVO({ folderId: 1, type: 'root' });
		accountService.setRootFolder(cachedRootFolder);

		expect(await resolveWithoutArchiveSwitch()).toBe(cachedRootFolder);
		expect(loadRootFolderSpy).not.toHaveBeenCalled();
	});

	it('should load the root for the current archive and store it on the account', async () => {
		const currentArchive = new ArchiveVO({ archiveId: 2977 });
		spyOn(accountService, 'getArchive').and.returnValue(currentArchive);

		const resolvedRootFolder = await resolveWithoutArchiveSwitch();

		expect(loadRootFolderSpy).toHaveBeenCalledWith(currentArchive);
		expect(resolvedRootFolder).toBe(stelaRootFolder);
		expect(accountService.getRootFolder()).toBe(stelaRootFolder);
	});
});
