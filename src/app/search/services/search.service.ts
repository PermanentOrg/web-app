import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { ItemVO, TagVOData } from '@models';
import Fuse from 'fuse.js';
import { Observable } from 'rxjs';
import { SearchResponse } from '@shared/services/api/index.repo';
import { TagsService } from '@core/services/tags/tags.service';

@Injectable()
export class SearchService {
	private fuseOptions: Fuse.IFuseOptions<ItemVO> = {
		keys: ['displayName'],
		threshold: 0.1,
		ignoreLocation: true,
	};
	private fuse = new Fuse([], this.fuseOptions);

	private tagsFuseOptions: Fuse.IFuseOptions<TagVOData> = {
		keys: ['name'],
		threshold: 0.1,
		ignoreLocation: true,
	};
	private tagsFuse = new Fuse([], this.tagsFuseOptions);

	constructor(
		private api: ApiService,
		private data: DataService,
		private tags: TagsService,
	) {
		this.data.currentFolderChange.subscribe(() => {
			this.indexCurrentFolder();
		});

		this.indexTags(this.tags.getTags());

		this.tags.getTags$().subscribe((newTags) => {
			this.indexTags(newTags);
		});
	}

	public getResultsInCurrentFolder(
		searchTerm: string,
		limit?: number,
	): ItemVO[] {
		return this.searchWithFuse(this.fuse, searchTerm, limit);
	}

	public getTagResults(searchTerm: string, limit?: number): TagVOData[] {
		return this.searchWithFuse(this.tagsFuse, searchTerm, limit);
	}

	public parseSearchTerm(termString: string): [string, TagVOData[]] {
		const splitByTerm = new RegExp(/\s(?=(?:[^"]+(["])[^"]+\1)*[^"]*$)/g);
		const getTagName = new RegExp(/"(.+)"/g);
		let queryString: string;
		const parsedTags: TagVOData[] = [];

		if (termString.match(/tag:"(.*)"/)) {
			const queryParts = [];
			const parts = termString.split(splitByTerm).filter((x) => x && x !== '"');
			for (const part of parts) {
				if (part.includes('tag:')) {
					const tagNames = part.match(getTagName) || [];
					for (const tagName of tagNames) {
						if (tagName) {
							const name = this.removeFirstAndLastQuotes(tagName);
							const tag = this.tags.getTagByName(name);
							if (tag) {
								parsedTags.push(tag);
							}
						}
					}
					if (!parsedTags.length) {
						queryString = termString;
					}
				} else {
					queryParts.push(part);
				}
			}
			if (queryParts.length) {
				queryString = queryParts.join(' ');
			}
		} else {
			queryString = termString;
		}
		return [queryString, parsedTags];
	}

	private removeFirstAndLastQuotes(str: string): string {
		return str.replace(/^"|"$/g, '');
	}

	public getResultsInCurrentArchive(
		searchTerm: string,
		tags: TagVOData[],
		limit?: number,
	): Observable<SearchResponse> {
		return this.api.search.itemsByNameObservable(searchTerm, tags, limit);
	}

	public getResultsInPublicArchive(
		searchTerm: string,
		tags: TagVOData[],
		archiveId: string,
		limit?: number,
	) {
		return this.api.search.itemsByNameInPublicArchiveObservable(
			searchTerm,
			tags,
			archiveId,
			limit,
		);
	}

	public getPublicArchiveTags(archiveId: string) {
		return this.api.search.getPublicArchiveTags(archiveId);
	}

	private searchWithFuse<T>(
		fuse: Fuse<T>,
		searchTerm: string,
		limit?: number,
	): T[] {
		if (!searchTerm) {
			return [];
		}
		return fuse
			.search(searchTerm)
			.slice(0, limit)
			.map((i) => i.item);
	}

	private indexCurrentFolder() {
		if (this.data.currentFolder?.ChildItemVOs) {
			this.fuse.setCollection(this.data.currentFolder.ChildItemVOs);
		} else {
			this.fuse.setCollection([]);
		}
	}

	private indexTags(tags: TagVOData[]) {
		if (tags?.length) {
			this.tagsFuse.setCollection(tags);
		} else {
			this.tagsFuse.setCollection([]);
		}
	}
}
