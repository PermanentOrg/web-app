import { TestBed } from '@angular/core/testing';
import { ArchiveVO, FolderVO, FolderVOData } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { RootFolderService } from './root-folder.service';

function buildFolderResponse(folderData: FolderVOData): FolderResponse {
	return new FolderResponse({
		isSuccessful: true,
		Results: [{ data: [{ FolderVO: folderData }] }],
	});
}

function buildStelaArchiveRoot(
	workspaceRootOverrides: Partial<Record<string, FolderVOData>> = {},
): FolderVOData {
	const workspaceRoots: Record<string, FolderVOData> = {
		'app-root': {
			folderId: 48585,
			folder_linkId: 126707,
			archiveNbr: '01it-0002',
			type: 'app-root',
		},
		'private-root': {
			folderId: 48586,
			folder_linkId: 126708,
			archiveNbr: '01it-0003',
			type: 'private-root',
		},
		'public-root': {
			folderId: 48587,
			folder_linkId: 126709,
			archiveNbr: '01it-0004',
			type: 'public-root',
		},
		...workspaceRootOverrides,
	};
	return {
		folderId: 48584,
		type: 'root',
		ChildItemVOs: Object.values(workspaceRoots)
			.filter(Boolean)
			.map((workspaceRoot) => new FolderVO(workspaceRoot)),
	};
}

describe('RootFolderService', () => {
	let service: RootFolderService;
	let getRootFolderIdSpy: jasmine.Spy;
	let getWithChildrenSpy: jasmine.Spy;
	const archive = new ArchiveVO({ archiveId: 2977, archiveNbr: '01it-0000' });

	beforeEach(() => {
		getRootFolderIdSpy = jasmine
			.createSpy('getRootFolderId')
			.and.resolveTo('48584');
		getWithChildrenSpy = jasmine
			.createSpy('getWithChildren')
			.and.resolveTo(buildFolderResponse(buildStelaArchiveRoot()));

		TestBed.configureTestingModule({
			providers: [
				RootFolderService,
				{
					provide: ApiService,
					useValue: {
						archive: { getRootFolderId: getRootFolderIdSpy },
						folder: { getWithChildren: getWithChildrenSpy },
					},
				},
			],
		});
		service = TestBed.inject(RootFolderService);
	});

	it('should load the root from Stela through the archive root folder id', async () => {
		const rootFolder = await service.loadRootFolder(archive);

		expect(getRootFolderIdSpy).toHaveBeenCalledWith(2977);
		expect(
			(getWithChildrenSpy.calls.mostRecent().args[0] as FolderVO[])[0].folderId,
		).toBe('48584');

		expect(rootFolder.type).toBe('root');
		expect(rootFolder.ChildItemVOs.map((child) => child.type)).toEqual([
			'app-root',
			'private-root',
			'public-root',
		]);

		expect(rootFolder.ChildItemVOs.every((child) => child instanceof FolderVO))
			.withContext('children are folder VOs, as the folder picker expects')
			.toBeTrue();
	});

	it('should reject with the Stela error when the archive cannot be read', async () => {
		const archiveFailure = new Error('404');
		getRootFolderIdSpy.and.rejectWith(archiveFailure);

		await expectAsync(service.loadRootFolder(archive)).toBeRejectedWith(
			archiveFailure,
		);

		expect(getWithChildrenSpy).not.toHaveBeenCalled();
	});

	it('should reject with the Stela error when the root folder cannot be loaded', async () => {
		const rootFolderFailure = new Error('500');
		getWithChildrenSpy.and.rejectWith(rootFolderFailure);

		await expectAsync(service.loadRootFolder(archive)).toBeRejectedWith(
			rootFolderFailure,
		);
	});

	it('should reject when Stela does not answer with an archive root', async () => {
		getWithChildrenSpy.and.resolveTo(
			buildFolderResponse({ ...buildStelaArchiveRoot(), type: 'private' }),
		);

		await expectAsync(service.loadRootFolder(archive)).toBeRejected();
	});

	it('should reject when Stela answers with no folder at all', async () => {
		getWithChildrenSpy.and.resolveTo(
			new FolderResponse({ isSuccessful: true, Results: [] }),
		);

		await expectAsync(service.loadRootFolder(archive)).toBeRejected();
	});

	['app-root', 'private-root', 'public-root'].forEach(
		(missingWorkspaceRoot) => {
			it(`should reject when the Stela root has no ${missingWorkspaceRoot}`, async () => {
				getWithChildrenSpy.and.resolveTo(
					buildFolderResponse(
						buildStelaArchiveRoot({ [missingWorkspaceRoot]: undefined }),
					),
				);

				await expectAsync(service.loadRootFolder(archive)).toBeRejected();
			});
		},
	);

	['folderId', 'folder_linkId', 'archiveNbr'].forEach((missingId) => {
		it(`should reject when a Stela workspace root has no ${missingId}`, async () => {
			const privateRootWithoutId: FolderVOData = {
				folderId: 48586,
				folder_linkId: 126708,
				archiveNbr: '01it-0003',
				type: 'private-root',
				[missingId]: undefined,
			};
			getWithChildrenSpy.and.resolveTo(
				buildFolderResponse(
					buildStelaArchiveRoot({ 'private-root': privateRootWithoutId }),
				),
			);

			await expectAsync(service.loadRootFolder(archive)).toBeRejected();
		});
	});
});
