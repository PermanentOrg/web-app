import {
	findAppsRootFolder,
	findPrivateRootFolder,
	findPublicRootFolder,
	isAppsRootFolder,
	isArchiveRootFolder,
	isDeprecatedFolder,
	isPrivateRootFolder,
	isPublicFolder,
	isPublicRootFolder,
	isShareRootFolder,
} from './folder-type';
import { FolderVO } from './folder-vo';
import { RecordVO } from './record-vo';
import { FolderType } from './vo-types';

function buildFolder(type: FolderType, folderId = 1): FolderVO {
	return new FolderVO({ folderId, type });
}

describe('folder type', () => {
	const predicateCases: Array<{
		predicateName: string;
		predicate: (folder: FolderVO) => boolean;
		matchingTypes: FolderType[];
	}> = [
		{
			predicateName: 'isArchiveRootFolder',
			predicate: isArchiveRootFolder,
			matchingTypes: ['type.folder.root.root', 'root'],
		},
		{
			predicateName: 'isAppsRootFolder',
			predicate: isAppsRootFolder,
			matchingTypes: ['type.folder.root.app', 'app-root'],
		},
		{
			predicateName: 'isPrivateRootFolder',
			predicate: isPrivateRootFolder,
			matchingTypes: ['type.folder.root.private', 'private-root'],
		},
		{
			predicateName: 'isPublicRootFolder',
			predicate: isPublicRootFolder,
			matchingTypes: ['type.folder.root.public', 'public-root'],
		},
		{
			predicateName: 'isPublicFolder',
			predicate: isPublicFolder,
			matchingTypes: [
				'type.folder.root.public',
				'public-root',
				'type.folder.public',
				'public',
			],
		},
		{
			predicateName: 'isShareRootFolder',
			predicate: isShareRootFolder,
			matchingTypes: ['type.folder.root.share', 'share-root'],
		},
		{
			predicateName: 'isDeprecatedFolder',
			predicate: isDeprecatedFolder,
			matchingTypes: ['deprecated'],
		},
	];

	const everyFolderType: FolderType[] = [
		'type.folder.root.root',
		'type.folder.root.app',
		'type.folder.root.private',
		'type.folder.root.public',
		'type.folder.root.share',
		'type.folder.root.vault',
		'type.folder.app',
		'type.folder.private',
		'type.folder.public',
		'type.folder.share',
		'type.folder.vault',
		'page',
		'root',
		'app-root',
		'app',
		'private-root',
		'private',
		'public-root',
		'public',
		'share-root',
		'deprecated',
	];

	predicateCases.forEach(({ predicateName, predicate, matchingTypes }) => {
		describe(predicateName, () => {
			everyFolderType.forEach((folderType) => {
				const shouldMatch = matchingTypes.includes(folderType);

				it(`should ${shouldMatch ? '' : 'not '}match ${folderType}`, () => {
					expect(predicate(buildFolder(folderType))).toBe(shouldMatch);
				});
			});

			it('should not match a missing folder', () => {
				expect(predicate(undefined)).toBeFalse();
			});
		});
	});

	it('should not treat a record as a public folder', () => {
		expect(
			isPublicFolder(new RecordVO({ type: 'type.record.image' })),
		).toBeFalse();
	});

	describe('archive root children', () => {
		it('should find the workspace roots in a root loaded from Stela', () => {
			const appsRoot = buildFolder('app-root', 2);
			const privateRoot = buildFolder('private-root', 3);
			const publicRoot = buildFolder('public-root', 4);
			const archiveRoot = new FolderVO({
				type: 'root',
				ChildItemVOs: [appsRoot, privateRoot, publicRoot],
			});

			expect(findAppsRootFolder(archiveRoot)).toBe(appsRoot);
			expect(findPrivateRootFolder(archiveRoot)).toBe(privateRoot);
			expect(findPublicRootFolder(archiveRoot)).toBe(publicRoot);
		});

		it('should find the workspace roots in a root loaded from v1', () => {
			const appsRoot = buildFolder('type.folder.root.app', 2);
			const privateRoot = buildFolder('type.folder.root.private', 3);
			const publicRoot = buildFolder('type.folder.root.public', 4);
			const archiveRoot = new FolderVO({
				type: 'type.folder.root.root',
				ChildItemVOs: [
					appsRoot,
					privateRoot,
					publicRoot,
					buildFolder('type.folder.root.share', 5),
				],
			});

			expect(findAppsRootFolder(archiveRoot)).toBe(appsRoot);
			expect(findPrivateRootFolder(archiveRoot)).toBe(privateRoot);
			expect(findPublicRootFolder(archiveRoot)).toBe(publicRoot);
		});

		it('should find nothing when the root is missing or has no children', () => {
			expect(findPrivateRootFolder(undefined)).toBeUndefined();
			expect(
				findPrivateRootFolder(new FolderVO({ type: 'root' })),
			).toBeUndefined();
		});
	});
});
