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

const V1_ARCHIVE_ROOT: FolderVOData = {
	folderId: 1,
	type: 'type.folder.root.root',
	ChildItemVOs: [
		new FolderVO({ folderId: 2, type: 'type.folder.root.private' }),
	],
};

describe('RootFolderService', () => {
	let service: RootFolderService;
	let getRootFolderIdSpy: jasmine.Spy;
	let getWithChildrenSpy: jasmine.Spy;
	let getRootSpy: jasmine.Spy;
	const archive = new ArchiveVO({ archiveId: 2977, archiveNbr: '01it-0000' });

	beforeEach(() => {
		getRootFolderIdSpy = jasmine
			.createSpy('getRootFolderId')
			.and.resolveTo('48584');
		getWithChildrenSpy = jasmine
			.createSpy('getWithChildren')
			.and.resolveTo(buildFolderResponse(buildStelaArchiveRoot()));
		getRootSpy = jasmine
			.createSpy('getRoot')
			.and.resolveTo(buildFolderResponse(V1_ARCHIVE_ROOT));

		TestBed.configureTestingModule({
			providers: [
				RootFolderService,
				{
					provide: ApiService,
					useValue: {
						archive: { getRootFolderId: getRootFolderIdSpy },
						folder: {
							getWithChildren: getWithChildrenSpy,
							getRoot: getRootSpy,
						},
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

		expect(getRootSpy).not.toHaveBeenCalled();
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

	it('should fall back to v1 when the Stela archive cannot be read', async () => {
		getRootFolderIdSpy.and.rejectWith(new Error('404'));

		const rootFolder = await service.loadRootFolder(archive);

		expect(getWithChildrenSpy).not.toHaveBeenCalled();
		expect(rootFolder.type).toBe('type.folder.root.root');
	});

	it('should fall back to v1 when the Stela root folder cannot be loaded', async () => {
		getWithChildrenSpy.and.rejectWith(new Error('500'));

		const rootFolder = await service.loadRootFolder(archive);

		expect(getRootSpy).toHaveBeenCalledTimes(1);
		expect(rootFolder.type).toBe('type.folder.root.root');
	});

	it('should fall back to v1 when there is no archive to look up', async () => {
		const rootFolder = await service.loadRootFolder(undefined);

		expect(getRootFolderIdSpy).not.toHaveBeenCalled();
		expect(rootFolder.type).toBe('type.folder.root.root');
	});

	it('should fall back to v1 when Stela does not answer with an archive root', async () => {
		getWithChildrenSpy.and.resolveTo(
			buildFolderResponse({ ...buildStelaArchiveRoot(), type: 'private' }),
		);

		const rootFolder = await service.loadRootFolder(archive);

		expect(rootFolder.type).toBe('type.folder.root.root');
	});

	['app-root', 'private-root', 'public-root'].forEach(
		(missingWorkspaceRoot) => {
			it(`should fall back to v1 when the Stela root has no ${missingWorkspaceRoot}`, async () => {
				getWithChildrenSpy.and.resolveTo(
					buildFolderResponse(
						buildStelaArchiveRoot({ [missingWorkspaceRoot]: undefined }),
					),
				);

				const rootFolder = await service.loadRootFolder(archive);

				expect(rootFolder.type).toBe('type.folder.root.root');
			});
		},
	);

	['folderId', 'folder_linkId', 'archiveNbr'].forEach((missingId) => {
		it(`should fall back to v1 when a Stela workspace root has no ${missingId}`, async () => {
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

			const rootFolder = await service.loadRootFolder(archive);

			expect(rootFolder.type).toBe('type.folder.root.root');
		});
	});

	it('should reject with the v1 error when both Stela and v1 fail', async () => {
		const v1Failure = new FolderResponse({ isSuccessful: false });
		getRootFolderIdSpy.and.rejectWith(new Error('404'));
		getRootSpy.and.rejectWith(v1Failure);

		await expectAsync(service.loadRootFolder(archive)).toBeRejectedWith(
			v1Failure,
		);
	});
});
