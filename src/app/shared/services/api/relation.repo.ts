/* @format */
import { RelationVO, ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';

export class RelationRepo extends BaseRepo {
	public getAll(archiveVO: ArchiveVO) {
		const data = [
			{
				RelationVO: {
					archiveId: archiveVO.archiveId,
				},
			},
		];

		return this.http.sendRequestPromise<RelationResponse>(
			'/relation/getAll',
			data,
			{ responseClass: RelationResponse },
		);
	}

	public create(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationArchiveId: relationVO.relationArchiveId,
				type: relationVO.type,
			},
		};

		return this.http.sendRequestPromise<RelationResponse>(
			'/relation/post',
			[data],
			{ responseClass: RelationResponse },
		);
	}

	public update(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
				type: relationVO.type,
			},
		};

		return this.http.sendRequestPromise<RelationResponse>(
			'/relation/update',
			[data],
			{ responseClass: RelationResponse },
		);
	}

	public accept(relationVO: RelationVO, relationMyVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
			},
			RelationMyVO: relationMyVO,
		};

		return this.http.sendRequestPromise<RelationResponse>(
			'/relation/acceptRelation',
			[data],
			{ responseClass: RelationResponse },
		);
	}

	public delete(relationVO: RelationVO) {
		const data = {
			RelationVO: {
				relationId: relationVO.relationId,
			},
		};

		return this.http.sendRequestPromise<RelationResponse>(
			'/relation/delete',
			[data],
			{ responseClass: RelationResponse },
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

		const relations = data.map((result) => {
			return result.map((resultList) => {
				return new RelationVO(resultList.RelationVO);
			});
		});

		return flatten(relations);
	}
}
