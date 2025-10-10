import { RelationVO, ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';

export class RelationRepo extends BaseRepo {
	public async getAll(archiveVO: ArchiveVO) {
		const data = [
			{
				RelationVO: {
					archiveId: archiveVO.archiveId,
				},
			},
		];

		return await this.http.sendRequestPromise<RelationResponse>(
			'/relation/getAll',
			data,
			{ ResponseClass: RelationResponse },
		);
	}

	public async create(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationArchiveId: relationVO.relationArchiveId,
				type: relationVO.type,
			},
		};

		return await this.http.sendRequestPromise<RelationResponse>(
			'/relation/post',
			[data],
			{ ResponseClass: RelationResponse },
		);
	}

	public async update(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
				type: relationVO.type,
			},
		};

		return await this.http.sendRequestPromise<RelationResponse>(
			'/relation/update',
			[data],
			{ ResponseClass: RelationResponse },
		);
	}

	public async accept(relationVO: RelationVO, relationMyVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
			},
			RelationMyVO: relationMyVO,
		};

		return await this.http.sendRequestPromise<RelationResponse>(
			'/relation/acceptRelation',
			[data],
			{ ResponseClass: RelationResponse },
		);
	}

	public async delete(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
			},
		};

		return await this.http.sendRequestPromise<RelationResponse>(
			'/relation/delete',
			[data],
			{ ResponseClass: RelationResponse },
		);
	}
}

export class RelationResponse extends BaseResponse {
	public getRelationVO() {
		const data = this.getResultsData();
		if (!data || !data.length || !data[0]) {
			return null;
		}

		return new RelationVO(data[0][0].RelationVO);
	}

	public getRelationVOs() {
		const data = this.getResultsData();
		if (!data || !data.length || !data[0]) {
			return [];
		}

		const relations = data.map((result) =>
			result.map((resultList) => new RelationVO(resultList.RelationVO)),
		);

		return flatten(relations);
	}
}
