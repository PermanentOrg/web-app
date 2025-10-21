import { FolderVO, FolderVOData, ItemVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { firstValueFrom, Observable } from 'rxjs';
import { DataStatus } from '@models/data-status.enum';
import {
	convertStelaLocationToLocnVOData,
	convertStelaRecordToRecordVO,
	convertStelaSharetoShareVO,
	convertStelaTagToTagVO,
	StelaLocation,
	StelaShare,
	StelaTag,
	type StelaRecord,
} from './record.repo';

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

// This is hard coded for now as we transition away from the PHP backend.
// In future we hope to remove the need for time zone objects entirely.
export const CENTRAL_TIMEZONE_VO = {
	timeZoneId: 88,
	displayName: 'Central Time',
	timeZonePlace: 'America/Chicago',
	stdName: 'Central Standard Time',
	stdAbbrev: 'CST',
	stdOffset: '-06:00',
	dstName: 'Central Daylight Time',
	dstAbbrev: 'CDT',
	dstOffset: '-05:00',
};

interface StelaFolder {
	folderId: string;
	size: number;
	location: StelaLocation;
	parentFolder: {
		id: string;
	};
	shares: Array<StelaShare>;
	tags: Array<StelaTag>;
	archive: {
		id: string;
		name: string;
	};
	createdAt: string;
	updatedAt: string;
	description: string;
	displayTimestamp: string;
	displayEndTimestamp: string;
	displayName: string;
	downloadName: string;
	imageRatio: number;
	paths: {
		names: string[];
	};
	publicAt: string;
	sort: string;
	thumbnailUrls: {
		'200': string;
		'256': string;
		'500': string;
		'1000': string;
		'2000': string;
	};
	type: string;
	status: string;
	view: string;
	children?: StelaFolderChild[];
}

interface PagedStelaResponse<T> {
	items: Array<T>;
}

type StelaFolderChild = StelaFolder | StelaRecord;

const isStelaRecord = (child: StelaFolderChild): child is StelaRecord =>
	child && 'recordId' in child;

const convertStelaFolderToFolderVO = (stelaFolder: StelaFolder): FolderVO => {
	stelaFolder.children ??= [];
	const childFolderVOs = stelaFolder.children
		.filter((child): child is StelaFolder => !isStelaRecord(child))
		.map(convertStelaFolderToFolderVO);
	const childRecordVOs = stelaFolder.children
		.filter(isStelaRecord)
		.map(convertStelaRecordToRecordVO);
	return new FolderVO({
		...stelaFolder,
		folderId: stelaFolder.folderId,
		archiveId: stelaFolder.archive?.id,
		displayName: stelaFolder.displayName,
		displayDT: stelaFolder.displayTimestamp,
		displayEndDT: stelaFolder.displayEndTimestamp,
		derivedDT: stelaFolder.displayTimestamp,
		derivedEndDT: stelaFolder.displayEndTimestamp,
		note: '',
		description: stelaFolder.description,
		sort: stelaFolder.sort,
		locnId: stelaFolder.location?.id,
		timeZoneId: 88, // Hard coded for now
		view: stelaFolder.view,
		imageRatio: stelaFolder.imageRatio,
		type: stelaFolder.type,
		thumbStatus: stelaFolder.status,
		thumbURL200: stelaFolder.thumbnailUrls['200'],
		thumbURL500: stelaFolder.thumbnailUrls['500'],
		thumbURL1000: stelaFolder.thumbnailUrls['1000'],
		thumbURL2000: stelaFolder.thumbnailUrls['2000'],
		thumbDT: stelaFolder.displayTimestamp,
		thumbnail256: stelaFolder.thumbnailUrls['256'],
		thumbnail256CloudPath: stelaFolder.thumbnailUrls['256'],
		status: stelaFolder.status,
		publicDT: stelaFolder.publicAt,
		parentFolderId: stelaFolder.parentFolder?.id,
		pathAsText: stelaFolder.paths.names,
		ParentFolderVOs: [new FolderVO({ folderId: stelaFolder.parentFolder?.id })],
		ChildFolderVOs: childFolderVOs,
		RecordVOs: childRecordVOs,
		LocnVO: convertStelaLocationToLocnVOData(stelaFolder.location),
		TimezoneVO: CENTRAL_TIMEZONE_VO,
		TagVOs: (stelaFolder.tags ?? []).map((stelaTag) =>
			convertStelaTagToTagVO(stelaTag, stelaFolder.archive?.id),
		),
		ChildItemVOs: [...childRecordVOs, ...childFolderVOs],
		ShareVOs: (stelaFolder.shares ?? []).map(convertStelaSharetoShareVO),
		isFolder: true,
	});
};

export class FolderRepo extends BaseRepo {
	public async getRoot(): Promise<FolderResponse> {
		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/getRoot',
			[],
			{
				ResponseClass: FolderResponse,
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
				ResponseClass: FolderResponse,
			},
		);
	}

	private async getStelaFolder(
		folderVO: FolderVO,
		shareToken: string = null,
	): Promise<StelaFolder> {
		const queryData = {
			folderIds: [folderVO.folderId],
		};
		let options = {};
		if (shareToken) {
			options = {
				authToken: false,
				shareToken,
			};
		}
		const folderResponse = (
			await firstValueFrom(
				this.httpV2.get<PagedStelaResponse<StelaFolder>>(
					`v2/folder`,
					queryData,
					null,
					options,
				),
			)
		)[0];
		return folderResponse.items[0];
	}

	private async getStelaFolderChildren(
		folderVO: FolderVO,
		shareToken: string = null,
	): Promise<StelaFolderChild[]> {
		const queryData = {
			pageSize: 99999999, // We want all results in one request
		};
		let options = {};
		if (shareToken) {
			options = {
				authToken: false,
				shareToken,
			};
		}
		const childrenResponse = (
			await firstValueFrom(
				this.httpV2.get<PagedStelaResponse<StelaFolderChild>>(
					`v2/folder/${folderVO.folderId}/children`,
					queryData,
					null,
					options,
				),
			)
		)[0];
		return childrenResponse.items;
	}

	public async getWithChildren(
		folderVOs: FolderVO[],
		shareToken: string = null,
	): Promise<FolderResponse> {
		// Stela has two separate endpoints -- one for loading the folder, one for loading the children.
		const requests = folderVOs.map(async (folderVO) => {
			const stelaFolder = await this.getStelaFolder(folderVO, shareToken);
			const stelaFolderChildren = await this.getStelaFolderChildren(
				folderVO,
				shareToken,
			);
			return {
				...stelaFolder,
				children: stelaFolderChildren,
			};
		});

		const stelaFolders = (await Promise.all(requests)).flat();

		// We need the `Results` to look the way v1 results look, for now.
		const simulatedV1FolderResponseResults = stelaFolders.map(
			(stelaFolder) => ({
				data: [
					{
						FolderVO: convertStelaFolderToFolderVO(stelaFolder),
					},
				],
				message: ['Folder retrieved'],
				status: true,
				resultDT: new Date().toISOString(),
				createdDT: null,
				updatedDT: null,
			}),
		);

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
			ResponseClass: FolderResponse,
		});
	}

	public async navigateLean(folderVO: FolderVO): Promise<FolderResponse> {
		const stelaFolder = await this.getStelaFolder(folderVO);
		stelaFolder.children = await this.getStelaFolderChildren(folderVO);
		const simulatedV1FolderResponseResults = [
			{
				data: [
					{
						FolderVO: convertStelaFolderToFolderVO(stelaFolder),
					},
				],
				message: ['Folder retrieved'],
				status: true,
				resultDT: new Date().toISOString(),
				createdDT: null,
				updatedDT: null,
			},
		];
		const folderResponse = new FolderResponse({
			isSuccessful: true,
			isSystemUp: true,
			Results: simulatedV1FolderResponseResults,
		});
		return folderResponse;
	}

	public getLeanItems(folderVOs: FolderVO[]): Observable<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
		}));

		return this.http.sendRequest<FolderResponse>('/folder/getLeanItems', data, {
			ResponseClass: FolderResponse,
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
				ResponseClass: FolderResponse,
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
			{ ResponseClass: FolderResponse },
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
			{ ResponseClass: FolderResponse },
		);
	}

	public async delete(folderVOs: FolderVO[]): Promise<FolderResponse> {
		const data = folderVOs.map((folderVO) => ({
			FolderVO: new FolderVO(folderVO),
		}));

		return await this.http.sendRequestPromise<FolderResponse>(
			'/folder/delete',
			data,
			{ ResponseClass: FolderResponse },
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
				ResponseClass: FolderResponse,
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
				ResponseClass: FolderResponse,
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
			{ ResponseClass: FolderResponse },
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
				ResponseClass: FolderResponse,
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
				ResponseClass: FolderResponse,
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
