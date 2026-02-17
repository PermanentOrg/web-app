import { StorageService } from '@shared/services/storage/storage.service';
import { FolderContentsType } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { ItemVO } from '@models';

export interface FolderThumbData {
	folderThumb: string;
	folderContentsType: FolderContentsType;
}

export class ThumbnailCache {
	private cache: Map<number, [string, string]>;
	private readonly STORAGE_KEY: string = 'folderThumbnailCache';

	constructor(private storage: StorageService) {
		this.fetchCacheMapFromStorage();
	}

	public saveThumbnail(item: ItemVO, thumbs: FolderThumbData): void {
		this.fetchCacheMapFromStorage();
		if (thumbs.folderContentsType === FolderContentsType.NORMAL) {
			this.cache.set(item.folder_linkId, [thumbs.folderThumb, '']);
		} else {
			this.cache.set(item.folder_linkId, ['icon', thumbs.folderContentsType]);
		}
		this.saveMapToStorage();
	}

	public getThumbnail(item: ItemVO): FolderThumbData {
		if (this.cache.has(item.folder_linkId)) {
			const thumbs = this.cache.get(item.folder_linkId);
			if (thumbs && Array.isArray(thumbs) && thumbs.length > 1) {
				if (thumbs[0] === 'icon') {
					return {
						folderThumb: '',
						folderContentsType: thumbs[1] as FolderContentsType,
					};
				}
				// Cast to string just to be sure we actually have strings from our data structure.
				return {
					folderThumb: `${thumbs[0]}`,
					folderContentsType: FolderContentsType.NORMAL,
				};
			} else {
				this.cache.delete(item.folder_linkId);
				this.saveMapToStorage();
			}
		}
		return {
			folderThumb: '',
			folderContentsType: FolderContentsType.BROKEN_THUMBNAILS,
		};
	}

	public hasThumbnail(item: ItemVO): boolean {
		return this.cache.has(item.folder_linkId);
	}

	public invalidateFolder(folderLinkId: number): void {
		if (this.cache.has(folderLinkId)) {
			this.cache.delete(folderLinkId);
			this.saveMapToStorage();
		}
	}

	private fetchCacheMapFromStorage(): void {
		const cacheData = this.storage.session.get(this.STORAGE_KEY);
		if (cacheData && Array.isArray(cacheData)) {
			this.cache = new Map<number, [string, string]>(cacheData);
		} else {
			this.cache = new Map<number, [string, string]>();
			this.saveMapToStorage();
		}
	}

	private saveMapToStorage(): void {
		this.storage.session.set(
			this.STORAGE_KEY,
			Array.from(this.cache.entries()),
		);
	}
}
