import { FolderVO, FolderVOData, ItemVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { firstValueFrom, Observable } from 'rxjs';
import { DataStatus } from '@models/data-status.enum';

const MIN_WHITELIST: (keyof FolderVO)[] = [
	'folderId',
	'archiveNbr',
	'folder_linkId',
];
const DEFAULT_WHITELIST: (keyof FolderVO)[] = [
	...MIN_WHITELIST,
	'displayName',
	'description',
	'displayDT',
	'displayEndDT',
	'view',
];

export class FolderRepo extends BaseRepo {
	public async getRoot(): Promise<FolderResponse> {
		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/getRoot',
			[],
			{
				responseClass: FolderResponse,
			},
		);
	}

	public async get(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: {
				archiveNbr: folderVO.archiveNbr,
				folder_linkId: folderVO.folder_linkId,
				folderId: folderVO.folderId,
			},
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/get',
			data,
			{
				responseClass: FolderResponse,
			},
		);
	}

	public async getWithChildren(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const params = {
			archiveId: folderVOs[0].archiveId,
			folderId: folderVOs[0].folderId,
		};

		const response = this.httpV2.get<FolderVO>(
			'/folder/getWithChildren',
			params,
		);
		const folderVos = await firstValueFrom(response);

		// We need the `Results` to look the way v1 results look.
		const simulatedV1FolderResponseResults = [
			folderVos.map((folderVo) => ({
				data: [{ FolderVO: folderVo }],
				message: ['Folder retrieved'],
			})),
		];
		const folderResponse = new FolderResponse({
			isSuccessful: true,
			isSystemUp: true,
			Results: simulatedV1FolderResponseResults,
		});
		return folderResponse;
	}

	public navigate(folderVO: FolderVO): Observable<FolderResponse> {
		const response = {
			...folderVO,
		};
		if (folderVO.type === 'type.folder.root.private') {
			response.displayName = 'Private';
		}

		const data = [
			{
				FolderVO: new FolderVO(response),
			},
		];

		return this.http.sendRequest<FolderResponse>('/folder/navigateMin', data, {
			responseClass: FolderResponse,
		});
	}

	public navigateLean(folderVO: FolderVO): Observable<FolderResponse> {
		const data = [
			{
				FolderVO: new FolderVO(folderVO),
			},
		];

		return this.http.sendRequest<FolderResponse>('/folder/navigateLean', data, {
			responseClass: FolderResponse,
		});
	}

	public getLeanItems(folderVOs: FolderVO[]): Observable<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
		}));

		return this.http.sendRequest<FolderResponse>('/folder/getLeanItems', data, {
			responseClass: FolderResponse,
		});
	}

	public async post(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/post',
			data,
			{
				responseClass: FolderResponse,
			},
		);
	}

	public async update(
		folderVOs: FolderVO[],
		whitelist = DEFAULT_WHITELIST,
	): Promise<FolderResponse> {
		if (whitelist !== DEFAULT_WHITELIST) {
			whitelist = [...whitelist, ...MIN_WHITELIST];
		}

		const data = folderVOs.map((vo) => {
			const updateData: FolderVOData = {};
			for (const prop of whitelist) {
				if (vo[prop] !== undefined) {
					updateData[prop] = vo[prop];
				}
			}

			return {
				FolderVO: new FolderVO(updateData),
			};
		});

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/update',
			data,
			{ responseClass: FolderResponse },
		);
	}

	public async updateRoot(
		folderVOs: FolderVO[],
		whitelist = DEFAULT_WHITELIST,
	): Promise<FolderResponse> {
		if (whitelist !== DEFAULT_WHITELIST) {
			whitelist = [...whitelist, ...MIN_WHITELIST];
		}

		const data = folderVOs.map((vo) => {
			const updateData: FolderVOData = {};
			for (const prop of whitelist) {
				if (vo[prop] !== undefined) {
					updateData[prop] = vo[prop];
				}
			}

			return {
				FolderVO: new FolderVO(updateData),
			};
		});

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/updateRootColumns',
			data,
			{ responseClass: FolderResponse },
		);
	}

	public async delete(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/delete',
			data,
			{ responseClass: FolderResponse },
		);
	}

	public async move(
		folderVOs: FolderVO[],
		destination: FolderVO,
	): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
			FolderDestVO: {
				folder_linkId: destination.folder_linkId,
			},
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/move',
			data,
			{
				responseClass: FolderResponse,
				useAuthorizationHeader: true,
			},
		);
	}

	public async copy(
		folderVOs: FolderVO[],
		destination: FolderVO,
	): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
			FolderDestVO: {
				folder_linkId: destination.folder_linkId,
			},
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/copy',
			data,
			{
				responseClass: FolderResponse,
				useAuthorizationHeader: true,
			},
		);
	}

	public async getPublicRoot(archiveNbr: string) {
		const data = [
			{
				ArchiveVO: {
					archiveNbr,
				},
			},
		];

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/getPublicRoot',
			data,
			{ responseClass: FolderResponse },
		);
	}

	public async sort(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO({
				folder_linkId: folderVO.folder_linkId,
				sort: folderVO.sort,
			}),
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/sort',
			data,
			{
				responseClass: FolderResponse,
			},
		);
	}

	public async createZip(items: ItemVO[]): Promise<FolderResponse> {
		const data = [
			{
				ZipVO: {
					items: items.map((i) => i.archiveNbr).join(','),
				},
			},
		];

		return await this.http.sendRequestPromise<FolderResponse>(
			'/zip/post',
			data,
			{
				responseClass: FolderResponse,
			},
		);
	}
}

export class FolderResponse extends BaseResponse {
	public getFolderVO(
		initChildren?: boolean,
		dataStatus: DataStatus = DataStatus.Placeholder,
	) {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return new FolderVO(data[0][0].FolderVO, initChildren, dataStatus);
	}

	public getFolderVOs(initChildren?: boolean) {
		const data = this.getResultsData();

		return data.map((result) => new FolderVO(result[0].FolderVO, initChildren));
	}
}
