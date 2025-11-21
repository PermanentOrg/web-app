import { Injectable } from '@angular/core';
import { RelationVO, ArchiveVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { RelationResponse } from '@shared/services/api/index.repo';
import Fuse, { IFuseOptions } from 'fuse.js';
import { find, remove } from 'lodash';

const REFRESH_THRESHOLD = 2 * 60 * 1000;

@Injectable({
	providedIn: 'root',
})
export class RelationshipService {
	private relations: RelationVO[] = null;
	private lastUpdated: Date;
	private currentArchive: ArchiveVO;

	private fuseOptions: IFuseOptions<RelationVO> = {
		keys: ['RelationArchiveVO.fullName'],
		threshold: 0.1,
	};
	private fuse = new Fuse([], this.fuseOptions);

	constructor(
		private accountService: AccountService,
		private api: ApiService,
	) {
		this.currentArchive = this.accountService.getArchive();
		this.accountService.archiveChange.subscribe((newArchive: ArchiveVO) => {
			this.currentArchive = newArchive;
			this.clear();
		});
	}

	async get(): Promise<RelationVO[]> {
		if (!this.relations || this.needsFetch()) {
			return await this.update().then(() => this.relations);
		} else {
			return await Promise.resolve(this.relations);
		}
	}

	getSync(): RelationVO[] {
		return this.relations || [];
	}

	async update(): Promise<any> {
		return await this.api.relation
			.getAll(this.currentArchive)
			.then((response: RelationResponse) => {
				this.lastUpdated = new Date();
				this.relations = response.getRelationVOs();
				this.indexArchivesForSearch();
			});
	}

	async remove(relation: RelationVO): Promise<any> {
		const response = await this.api.relation.delete(relation);
		remove(this.relations, { relationId: relation.relationId });
		this.indexArchivesForSearch();
		return response;
	}

	indexArchivesForSearch() {
		if (this.relations) {
			this.fuse.setCollection(
				this.relations.filter(
					(r) =>
						r.RelationArchiveVO.archiveId !== this.currentArchive.archiveId,
				),
			);
		} else {
			this.fuse.setCollection([]);
		}
	}

	clear() {
		this.relations = null;
		this.lastUpdated = null;
		this.indexArchivesForSearch();
	}

	hasRelation(archive: ArchiveVO) {
		const matchArchive = find(
			this.relations,
			(relation: RelationVO) =>
				relation.RelationArchiveVO.archiveId === archive.archiveId,
		);

		if (matchArchive) {
			return true;
		} else {
			return false;
		}
	}

	needsFetch() {
		if (!this.lastUpdated) {
			return true;
		}
		const lastFetch = this.lastUpdated.getTime();
		const now = new Date().getTime();
		return now - lastFetch > REFRESH_THRESHOLD;
	}

	searchRelationsByName(query: string) {
		return this.fuse.search(query).map((i) => i.item as RelationVO);
	}
}
