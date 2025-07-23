/* @format */
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { FolderVO, RecordVO } from '@root/app/models';
import { PublishIaData } from '@models/publish-ia-vo';

export class PublishRepo extends BaseRepo {
	public getResource(urlToken: string): Promise<PublishResponse> {
		const data = [
			{
				PublishurlVO: {
					urltoken: urlToken,
				},
			},
		];

		return this.http.sendRequestPromise<PublishResponse>(
			'/publish/getResource',
			data,
			{ responseClass: PublishResponse },
		);
	}

	public publishToInternetArchive(
		publishIa: PublishIaData,
	): Promise<PublishResponse> {
		const data = [
			{
				Publish_iaVO: publishIa,
			},
		];

		return this.http.sendRequestPromise<PublishResponse>(
			'/publish_ia/publish',
			data,
			{ responseClass: PublishResponse },
		);
	}

	public getInternetArchiveLink(
		publishIa: Pick<PublishIaData, 'folder_linkId'>,
	): Promise<PublishResponse> {
		const data = [
			{
				Publish_iaVO: publishIa,
			},
		];

		return this.http.sendRequestPromise<PublishResponse>(
			'/publish_ia/getLink',
			data,
			{ responseClass: PublishResponse },
		);
	}
}

export class PublishResponse extends BaseResponse {
	public getRecordVO() {
		const data = this.getResultsData();
		if (!data || !data.length || !data[0][0].RecordVO) {
			return null;
		}

		return new RecordVO(data[0][0].RecordVO);
	}

	public getFolderVO(initChildren?: boolean) {
		const data = this.getResultsData();
		if (!data || !data.length || !data[0][0].FolderVO) {
			return null;
		}

		return new FolderVO(data[0][0].FolderVO, initChildren);
	}

	public getPublishIaVO(): PublishIaData {
		const data = this.getResultsData();

		if (!data?.length || !data[0][0].Publish_iaVO) {
			return null;
		}

		return data[0][0].Publish_iaVO;
	}
}
