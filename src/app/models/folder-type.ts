import { FolderVO } from './folder-vo';
import { FolderType } from './vo-types';
import { ItemVO } from '.';

// Stela sends its own short folder types; the v1 root fallback and the folders
// the app builds itself still carry the type.folder.* ones.
const ARCHIVE_ROOT_FOLDER_TYPES: FolderType[] = [
	'type.folder.root.root',
	'root',
];
const APPS_ROOT_FOLDER_TYPES: FolderType[] = [
	'type.folder.root.app',
	'app-root',
];
const PRIVATE_ROOT_FOLDER_TYPES: FolderType[] = [
	'type.folder.root.private',
	'private-root',
];
const PUBLIC_ROOT_FOLDER_TYPES: FolderType[] = [
	'type.folder.root.public',
	'public-root',
];
const SHARE_ROOT_FOLDER_TYPES: FolderType[] = [
	'type.folder.root.share',
	'share-root',
];
const PUBLIC_FOLDER_TYPES: FolderType[] = [
	...PUBLIC_ROOT_FOLDER_TYPES,
	'type.folder.public',
	'public',
];

function hasFolderType(
	item: ItemVO | undefined,
	folderTypes: FolderType[],
): boolean {
	return folderTypes.some((folderType) => folderType === item?.type);
}

export function isArchiveRootFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, ARCHIVE_ROOT_FOLDER_TYPES);
}

export function isAppsRootFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, APPS_ROOT_FOLDER_TYPES);
}

export function isPrivateRootFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, PRIVATE_ROOT_FOLDER_TYPES);
}

export function isPublicRootFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, PUBLIC_ROOT_FOLDER_TYPES);
}

export function isPublicFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, PUBLIC_FOLDER_TYPES);
}

export function isShareRootFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, SHARE_ROOT_FOLDER_TYPES);
}

export function isDeprecatedFolder(item: ItemVO | undefined): boolean {
	return hasFolderType(item, ['deprecated']);
}

function findArchiveRootChild(
	archiveRootFolder: FolderVO | undefined,
	isWantedChild: (item: ItemVO) => boolean,
): FolderVO | undefined {
	return archiveRootFolder?.ChildItemVOs?.find(isWantedChild) as
		| FolderVO
		| undefined;
}

export function findAppsRootFolder(
	archiveRootFolder: FolderVO | undefined,
): FolderVO | undefined {
	return findArchiveRootChild(archiveRootFolder, isAppsRootFolder);
}

export function findPrivateRootFolder(
	archiveRootFolder: FolderVO | undefined,
): FolderVO | undefined {
	return findArchiveRootChild(archiveRootFolder, isPrivateRootFolder);
}

export function findPublicRootFolder(
	archiveRootFolder: FolderVO | undefined,
): FolderVO | undefined {
	return findArchiveRootChild(archiveRootFolder, isPublicRootFolder);
}
