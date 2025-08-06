/* @format */
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
	public getShares() {
		return this.http.sendRequestPromise<ShareResponse>('/share/getShares', [], {
			responseClass: ShareResponse,
		});
	}

	public update(share: ShareVO) {
		const data = {
			ShareVO: share,
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/update',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public upsert(share: ShareVO) {
		const data = {
			ShareVO: share,
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/upsert',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public remove(share: ShareVO) {
		const data = {
			ShareVO: {
				shareId: share.shareId,
				folder_linkId: share.folder_linkId,
				archiveId: share.archiveId,
			},
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/delete',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public generateShareLink(item: RecordVO | FolderVO) {
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

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/generateShareLink',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public getShareLink(item: RecordVO | FolderVO) {
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

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/getLink',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public checkShareLink(urlToken: string) {
		const data = {
			Shareby_urlVO: {
				urlToken,
			},
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/checkShareLink',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public updateShareLink(vo: ShareByUrlVO) {
		const data = {
			Shareby_urlVO: vo,
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/updateShareLink',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public removeShareLink(vo: ShareByUrlVO) {
		const data = {
			Shareby_urlVO: vo,
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/dropShareLink',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public requestShareAccess(urlToken: string) {
		const data = {
			Shareby_urlVO: {
				urlToken,
			},
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/requestShareAccess',
			[data],
			{ responseClass: ShareResponse },
		);
	}

	public getShareForPreview(shareId, folder_linkId) {
		const data = {
			ShareVO: {
				shareId: parseInt(shareId, 10),
				folder_linkId: parseInt(folder_linkId, 10),
			},
		};

		return this.http.sendRequestPromise<ShareResponse>(
			'/share/getShareForPreview',
			[data],
			{ responseClass: ShareResponse },
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

			return result.map((resultList) => {
				return new ArchiveVO(resultList.ArchiveVO);
			});
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
