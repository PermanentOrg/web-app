import { StorageService } from '@shared/services/storage/storage.service';
import { FolderContentsType } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { ItemVO } from '@models';

export interface FolderThumbData {
	folderThumb: string;
	folderContentsType: FolderContentsType;
}

enum CachedThumbnailType {
	Image = 'image',
	Icon = 'icon',
}

interface CachedImage {
	type: CachedThumbnailType.Image;
	url: string;
}

interface CachedIcon {
	type: CachedThumbnailType.Icon;
	icon: FolderContentsType;
}

type CachedThumbnail = CachedImage | CachedIcon;

function isCachedThumbnail(entry: unknown): entry is CachedThumbnail {
	return (
		typeof entry === 'object' &&
		entry !== null &&
		'type' in entry &&
		Object.values(CachedThumbnailType).some((v) => v === entry.type)
	);
}

export class ThumbnailCache {
	// Stores `unknown` because entries are hydrated from local storage,
	// which may contain entries in an old or otherwise unexpected format.
	private entriesByFolderLinkId: Map<number, unknown> = new Map();
	private readonly STORAGE_KEY: string = 'folderThumbnailCache';

	constructor(private storage: StorageService) {
		this.loadEntriesFromStorage();
	}

	public saveThumbnail(item: ItemVO, thumbs: FolderThumbData): void {
		this.loadEntriesFromStorage();
		if (thumbs.folderContentsType === FolderContentsType.NORMAL) {
			this.entriesByFolderLinkId.set(item.folder_linkId, {
				type: CachedThumbnailType.Image,
				url: thumbs.folderThumb,
			});
		} else {
			this.entriesByFolderLinkId.set(item.folder_linkId, {
				type: CachedThumbnailType.Icon,
				icon: thumbs.folderContentsType,
			});
		}
		this.saveEntriesToStorage();
	}

	public getThumbnail(item: ItemVO): FolderThumbData {
		if (this.entriesByFolderLinkId.has(item.folder_linkId)) {
			const cacheEntry = this.entriesByFolderLinkId.get(item.folder_linkId);
			if (isCachedThumbnail(cacheEntry)) {
				if (cacheEntry.type === CachedThumbnailType.Image) {
					return {
						folderThumb: cacheEntry.url,
						folderContentsType: FolderContentsType.NORMAL,
					};
				}
				if (cacheEntry.type === CachedThumbnailType.Icon) {
					return {
						folderThumb: '',
						folderContentsType: cacheEntry.icon,
					};
				}
			}
			this.entriesByFolderLinkId.delete(item.folder_linkId);
			this.saveEntriesToStorage();
		}
		return {
			folderThumb: '',
			folderContentsType: FolderContentsType.BROKEN_THUMBNAILS,
		};
	}

	public hasThumbnail(item: ItemVO): boolean {
		if (!this.entriesByFolderLinkId.has(item.folder_linkId)) {
			return false;
		}
		if (isCachedThumbnail(this.entriesByFolderLinkId.get(item.folder_linkId))) {
			return true;
		}
		this.entriesByFolderLinkId.delete(item.folder_linkId);
		this.saveEntriesToStorage();
		return false;
	}

	public invalidateFolder(folderLinkId: number): void {
		if (this.entriesByFolderLinkId.has(folderLinkId)) {
			this.entriesByFolderLinkId.delete(folderLinkId);
			this.saveEntriesToStorage();
		}
	}

	private loadEntriesFromStorage(): void {
		const storedEntries = this.storage.session.get(this.STORAGE_KEY);
		if (storedEntries && Array.isArray(storedEntries)) {
			this.entriesByFolderLinkId = new Map<number, unknown>(storedEntries);
		} else {
			this.entriesByFolderLinkId = new Map<number, unknown>();
		}
	}

	private saveEntriesToStorage(): void {
		this.storage.session.set(
			this.STORAGE_KEY,
			Array.from(this.entriesByFolderLinkId.entries()),
		);
	}
}
