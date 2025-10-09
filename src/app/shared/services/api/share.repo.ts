import {
	FolderVO,
	ArchiveVO,
	ShareVO,
	RecordVO,
	ShareByUrlVO,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten, compact } from 'lodash';

export class ShareRepo extends BaseRepo {
	public async getShares() {
		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/getShares',
			[],
			{
				ResponseClass: ShareResponse,
			},
		);
	}

	public async update(share: ShareVO) {
		const data = {
			ShareVO: share,
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/update',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async upsert(share: ShareVO) {
		const data = {
			ShareVO: share,
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/upsert',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async remove(share: ShareVO) {
		const data = {
			ShareVO: {
				shareId: share.shareId,
				folder_linkId: share.folder_linkId,
				archiveId: share.archiveId,
			},
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/delete',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async generateShareLink(item: RecordVO | FolderVO) {
		const data: any = {};

		if (item.isRecord) {
			data.RecordVO = {
				folder_linkId: item.folder_linkId,
			};
		} else {
			data.FolderVO = {
				folder_linkId: item.folder_linkId,
			};
		}

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/generateShareLink',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async getShareLink(item: RecordVO | FolderVO) {
		const data: any = {};

		if (item.isRecord) {
			data.RecordVO = {
				folder_linkId: item.folder_linkId,
			};
		} else {
			data.FolderVO = {
				folder_linkId: item.folder_linkId,
			};
		}

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/getLink',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async checkShareLink(urlToken: string) {
		const data = {
			Shareby_urlVO: {
				urlToken,
			},
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/checkShareLink',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async updateShareLink(vo: ShareByUrlVO) {
		const data = {
			Shareby_urlVO: vo,
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/updateShareLink',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async removeShareLink(vo: ShareByUrlVO) {
		const data = {
			Shareby_urlVO: vo,
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/dropShareLink',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async requestShareAccess(urlToken: string) {
		const data = {
			Shareby_urlVO: {
				urlToken,
			},
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/requestShareAccess',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}

	public async getShareForPreview(shareId, folderLinkId) {
		const data = {
			ShareVO: {
				shareId: parseInt(shareId, 10),
				folder_linkId: parseInt(folderLinkId, 10),
			},
		};

		return await this.http.sendRequestPromise<ShareResponse>(
			'/share/getShareForPreview',
			[data],
			{ ResponseClass: ShareResponse },
		);
	}
}

export class ShareResponse extends BaseResponse {
	public getShareArchiveVOs() {
		const data = this.getResultsData();
		const archives = data.map((result) => {
			if (!result) {
				return null;
			}

			return result.map((resultList) => new ArchiveVO(resultList.ArchiveVO));
		});

		return compact(flatten(archives));
	}

	public getShareVO() {
		const data = this.getResultsData();
		if (!data || !data.length || !data[0]) {
			return null;
		}

		return new ShareVO(data[0][0].ShareVO);
	}

	public getShareByUrlVO() {
		const data = this.getResultsData();
		if (
			!data ||
			!data.length ||
			!data[0] ||
			!data[0][0].Shareby_urlVO ||
			!data[0][0].Shareby_urlVO.shareUrl
		) {
			return null;
		}

		return new ShareByUrlVO(data[0][0].Shareby_urlVO);
	}
}
