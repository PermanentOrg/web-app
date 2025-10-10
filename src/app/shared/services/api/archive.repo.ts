import {
	AccountVO,
	ArchiveVO,
	AccountStorage,
	TagVOData,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten, isArray } from 'lodash';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { getFirst } from '../http-v2/http-v2.service';

export class ArchiveRepo extends BaseRepo {
	public async get(archives: ArchiveVO[]): Promise<ArchiveResponse> {
		const data = archives.map((archive) => ({
			ArchiveVO: new ArchiveVO({
				archiveNbr: archive.archiveNbr,
				archiveId: archive.archiveId,
			}),
		}));

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/get',
			data,
			{
				ResponseClass: ArchiveResponse,
			},
		);
	}

	public async getAllArchives(accountVO: AccountVO): Promise<ArchiveResponse> {
		const data = [
			{
				AccountVO: {
					accountId: accountVO.accountId,
				},
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/getAllArchives',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async change(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/change',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async update(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/update',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async delete(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/delete',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async create(
		archive: ArchiveVO | ArchiveVO[],
	): Promise<ArchiveResponse> {
		if (!isArray(archive)) {
			archive = [archive];
		}

		const data = archive.map((archiveVo) => ({ ArchiveVO: archiveVo }));

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/post',
			data,
			{ ResponseClass: ArchiveResponse, useAuthorizationHeader: true },
		);
	}

	public async accept(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/accept',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async decline(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/decline',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async getMembers(archive: ArchiveVO): Promise<ArchiveResponse> {
		const data = [
			{
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/getShares',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async addMember(
		member: AccountVO,
		archive: ArchiveVO,
	): Promise<ArchiveResponse> {
		const data = [
			{
				AccountVO: member,
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/share',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async transferOwnership(
		member: AccountVO,
		archive: ArchiveVO,
	): Promise<ArchiveResponse> {
		const data = [
			{
				AccountVO: member,
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/transferOwnership',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async updateMember(
		member: AccountVO,
		archive: ArchiveVO,
	): Promise<ArchiveResponse> {
		const data = [
			{
				AccountVO: member,
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise('/archive/updateShare', data, {
			ResponseClass: ArchiveResponse,
		});
	}

	public async removeMember(
		member: AccountVO,
		archive: ArchiveVO,
	): Promise<ArchiveResponse> {
		const data = [
			{
				AccountVO: member,
				ArchiveVO: archive,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/archive/unshare',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async getAllProfileItems(
		archive: ArchiveVO,
	): Promise<ArchiveResponse> {
		const data = [
			{
				Profile_itemVO: {
					archiveId: archive.archiveId,
					archiveNbr: archive.archiveNbr,
				},
			},
		];

		const endpoint = archive?.archiveNbr
			? '/profile_item/getAllByArchiveNbr'
			: '/profile_item/getAllByArchiveId';

		if (!archive?.archiveId && !archive?.archiveNbr) {
			return;
		}

		return await this.http.sendRequestPromise<ArchiveResponse>(endpoint, data, {
			ResponseClass: ArchiveResponse,
		});
	}

	public async addUpdateProfileItems(profileItems: ProfileItemVOData[]) {
		const data = profileItems.map((i) => ({
			Profile_itemVO: i,
		}));

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/profile_item/safeAddUpdate',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async deleteProfileItem(profileItem: ProfileItemVOData) {
		const data = [
			{
				Profile_itemVO: profileItem,
			},
		];

		return await this.http.sendRequestPromise<ArchiveResponse>(
			'/profile_item/delete',
			data,
			{ ResponseClass: ArchiveResponse },
		);
	}

	public async getArchiveStorage(archiveId) {
		return await getFirst(
			this.httpV2.get<AccountStorage>(
				`v2/archive/${archiveId}/payer-account-storage`,
			),
		).toPromise();
	}

	public async getPublicArchiveTags(archiveId: string) {
		return await this.httpV2
			.get<TagVOData>(`v2/archive/${archiveId}/tags/public`)
			.toPromise();
	}
}

export class ArchiveResponse extends BaseResponse {
	public getArchiveVO() {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return new ArchiveVO(data[0][0].ArchiveVO);
	}

	public getArchiveVOs(): ArchiveVO[] {
		const data = this.getResultsData();
		const archives = data.map((result) =>
			result.map((resultList) => new ArchiveVO(resultList.ArchiveVO)),
		);

		return flatten(archives);
	}

	public getAccountVOs() {
		const data = this.getResultsData();
		const accounts = data.map((result) =>
			result.map((resultList) => new AccountVO(resultList.AccountVO)),
		);

		return flatten(accounts);
	}

	public getProfileItemVOs() {
		const data = flatten(this.getResultsData());
		const profileItems = data.map((result) => result.Profile_itemVO);

		return profileItems as ProfileItemVOData[];
	}
}
