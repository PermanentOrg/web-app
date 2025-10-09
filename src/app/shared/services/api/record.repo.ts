import {
	RecordVO,
	FolderVO,
	TagVO,
	FolderLinkType,
	ShareVO,
	LocnVOData,
} from '@root/app/models';
import {
	BaseResponse,
	BaseRepo,
	LeanWhitelist,
} from '@shared/services/api/base';

import { StorageService } from '@shared/services/storage/storage.service';
import { ThumbnailCache } from '@shared/utilities/thumbnail-cache/thumbnail-cache';
import { firstValueFrom } from 'rxjs';
import { FileFormat, PermanentFile } from '@models/file-vo';
import { ShareStatus } from '@models/share-vo';
import { AccessRoleType } from '@models/access-role';
import { getFirst } from '../http-v2/http-v2.service';
import { CENTRAL_TIMEZONE_VO } from './folder.repo';

class MultipartUploadUrlsList {
	public urls: string[] = [];
	public uploadId: string;
	public key: string;

	protected isInstance(obj: unknown): obj is MultipartUploadUrlsList {
		return (
			typeof obj === 'object' &&
			'urls' in obj &&
			obj.urls instanceof Array &&
			typeof obj.urls.length === 'number' &&
			'uploadId' in obj &&
			typeof obj.uploadId === 'string' &&
			'key' in obj &&
			typeof obj.key === 'string'
		);
	}

	constructor(obj: unknown) {
		if (this.isInstance(obj)) {
			this.urls = obj.urls;
			this.uploadId = obj.uploadId;
			this.key = obj.key;
		}
	}
}

// These types are here so we can shim stela responses to the format expected
// by our components.  Eventually we will want to refactor those components
// to simply use what stela provides, but there is work to be done regarding
// overall type safety in this code base before we want to take that project
// on.
export interface StelaTag {
	id: string;
	name: string;
	type: string;
}
interface StelaFile {
	size: number;
	type: string;
	fileId: string;
	format: FileFormat;
	fileUrl: string;
	createdAt: string;
	updatedAt: string;
	downloadUrl: string;
}
export interface StelaLocation {
	id: string;
	streetNumber: string;
	streetName: string;
	locality: string;
	county: string;
	state: string;
	latitude: number;
	longitude: number;
	country: string;
	countryCode: string;
	displayName: string | null;
}
interface StelaArchive {
	id: string;
	archiveNumber: string;
	name: string;
}
export interface StelaShare {
	id: string;
	status: ShareStatus;
	accessRole: AccessRoleType;
	archive: {
		id: string;
		name: string;
		thumbUrl200: string;
	};
}
export type StelaRecord = Omit<RecordVO, 'files'> & {
	tags: Array<StelaTag> | null;
	archiveNumber: string;
	displayDate: string;
	folderLinkId: string;
	folderLinkType: FolderLinkType;
	parentFolderLinkId: string;
	thumbUrl200: string;
	thumbUrl500: string;
	thumbUrl1000: string;
	thumbUrl2000: string;
	location: StelaLocation | null;
	files: Array<StelaFile>;
	createdAt: string;
	updatedAt: string;
	archive: StelaArchive;
	shares: Array<StelaShare> | null;
};

const resolveTagName = (tag: StelaTag): string => {
	if (tag.type?.includes('type.tag.metadata')) {
		const customMetadataType = tag.type.split('.').pop();
		return `${customMetadataType}:${tag.name}`;
	}
	return tag.name;
};

export const convertStelaTagToTagVO = (
	stelaTag: StelaTag,
	archiveId: string,
): TagVO =>
	new TagVO({
		tagId: Number.parseInt(stelaTag.id),
		name: resolveTagName(stelaTag),
		type: stelaTag.type,
		archiveId: Number.parseInt(archiveId, 10),
	});

const convertStelaFileToPermanentFile = (
	stelaFile: StelaFile,
): PermanentFile => ({
	...stelaFile,
	fileId: Number.parseInt(stelaFile.fileId, 10),
	fileURL: stelaFile.fileUrl,
	downloadURL: stelaFile.downloadUrl,
});

export const convertStelaSharetoShareVO = (stelaShare: StelaShare): ShareVO =>
	new ShareVO({
		shareId: stelaShare.id,
		status: stelaShare.status,
		accessRole: stelaShare.accessRole,
		ArchiveVO: {
			archiveId: stelaShare.archive.id,
			fullName: stelaShare.archive.name,
			thumbURL200: stelaShare.archive.thumbUrl200,
		},
	});

export const convertStelaLocationToLocnVOData = (
	stelaLocation: StelaLocation,
): LocnVOData =>
	stelaLocation.id
		? {
				...stelaLocation,
				locnId: Number.parseInt(stelaLocation.id, 10),
			}
		: null;

export const convertStelaRecordToRecordVO = (
	stelaRecord: StelaRecord,
): RecordVO =>
	new RecordVO({
		...stelaRecord,
		TagVOs: (stelaRecord.tags ?? []).map((stelaTag) =>
			convertStelaTagToTagVO(stelaTag, stelaRecord.archiveId),
		),
		archiveNbr: stelaRecord.archiveNumber,
		displayDT: stelaRecord.displayDate,
		folder_linkId: Number.parseInt(stelaRecord.folderLinkId, 10),
		folder_linkType: stelaRecord.folderLinkType,
		LocnVO: convertStelaLocationToLocnVOData(stelaRecord.location),
		FileVOs: stelaRecord.files.map(convertStelaFileToPermanentFile),
		createdDT: stelaRecord.createdAt,
		updatedDT: stelaRecord.updatedAt,
		locnId: stelaRecord.location?.id || null,
		parentFolder_linkId: stelaRecord.parentFolderLinkId,
		TextDataVOs: [],
		ArchiveVOs: [],
		timeZoneId: CENTRAL_TIMEZONE_VO.timeZoneId,
		TimezoneVO: CENTRAL_TIMEZONE_VO,
		ShareVOs: (stelaRecord.shares ?? []).map(convertStelaSharetoShareVO),
	});

export class RecordRepo extends BaseRepo {
	private async getRecordIdByArchiveNbr(archiveNbr: string): Promise<number> {
		const recordResponse = await this.http.sendRequestPromise<RecordResponse>(
			'/record/get',
			[{ RecordVO: new RecordVO({ archiveNbr }) }],
			{
				ResponseClass: RecordResponse,
			},
		);
		const recordVo = recordResponse.getRecordVO();
		return recordVo.recordId;
	}
	public async get(
		recordVOs: RecordVO[],
		shareToken: string | null = null,
	): Promise<RecordResponse> {
		const recordIds = await Promise.all(
			// There are some flows (e.g. published records) where only the archiveNbr is known.
			// In those cases, we need to look up the recordId first since stela API has phased
			// out archiveNbr.
			recordVOs.map(
				async (record: RecordVO): Promise<number> =>
					record.recordId ??
					(await this.getRecordIdByArchiveNbr(record.archiveNbr)),
			),
		);
		const data = {
			recordIds,
		};
		let options = {};
		if (shareToken) {
			options = {
				authToken: false,
				shareToken,
			};
		}
		const stelaRecords = await firstValueFrom(
			this.httpV2.get<StelaRecord>('v2/record', data, null, options),
		);

		// We need the `Results` to look the way v1 results look, for now.
		const simulatedV1RecordResponseResults = stelaRecords.map(
			(stelaRecord) => ({
				data: [
					{
						RecordVO: convertStelaRecordToRecordVO(stelaRecord),
					},
				],
				message: ['Record retrieved'],
				status: true,
				resultDT: new Date().toISOString(),
				createdDT: null,
				updatedDT: null,
			}),
		);
		const recordResponse = new RecordResponse({
			isSuccessful: true,
			isSystemUp: true,
			Results: simulatedV1RecordResponseResults,
		});
		return recordResponse;
	}

	public async getLean(
		recordVOs: RecordVO[],
		whitelist?: string[],
	): Promise<RecordResponse> {
		const data = recordVOs.map((recordVO) => {
			const newVO = new RecordVO(recordVO);
			newVO.dataWhitelist = whitelist || LeanWhitelist;
			return {
				RecordVO: newVO,
			};
		});

		return await this.http.sendRequestPromise<RecordResponse>(
			'/record/getLean',
			data,
			{ ResponseClass: RecordResponse },
		);
	}

	public async getPresignedUrl(
		recordVO: RecordVO,
		fileType: string,
	): Promise<BaseResponse> {
		return await this.http.sendRequestPromise('/record/getPresignedUrl', [
			{
				RecordVO: recordVO,
				SimpleVO: {
					key: 'type',
					value: fileType,
				},
			},
		]);
	}

	public async registerRecord(
		recordVO: RecordVO,
		s3url: string,
		archiveId: string,
	): Promise<RecordVO> {
		return (
			await firstValueFrom(
				this.httpV2.post(
					'/record/registerRecord',
					{
						displayName: recordVO.displayName,
						parentFolderId: recordVO.parentFolderId,
						uploadFileName: recordVO.uploadFileName,
						size: recordVO.size,
						s3url,
						archiveId,
					},
					RecordVO,
				),
			)
		)[0];
	}

	public async getMultipartUploadURLs(
		size: number,
	): Promise<MultipartUploadUrlsList> {
		return await getFirst(
			this.httpV2.post(
				'/record/getMultipartUploadUrls',
				{
					fileSizeInBytes: size,
				},
				MultipartUploadUrlsList,
			),
		).toPromise();
	}

	public async registerMultipartRecord(
		record: RecordVO,
		uploadId: string,
		key: string,
		eTags: string[],
		archiveId: string,
	): Promise<RecordVO> {
		const body = {
			archiveId,
			displayName: record.displayName,
			parentFolderId: record.parentFolderId,
			uploadFileName: record.uploadFileName,
			size: record.size,
			multipartUploadData: {
				uploadId,
				key,
				parts: eTags.map((ETag, index) => ({
					PartNumber: index + 1,
					ETag,
				})),
			},
		};

		return await getFirst(
			this.httpV2.post<RecordVO>('/record/registerRecord', body),
		).toPromise();
	}

	public async update(recordVOs: RecordVO[], archiveId: number) {
		return await firstValueFrom(
			this.httpV2.post(
				'/record/update',
				this.prepareUpdateRecordRequest(recordVOs, archiveId),
				null,
			),
		);
	}

	private prepareUpdateRecordRequest(recordVOs: RecordVO[], archiveId: number) {
		const record: any = Object.assign({}, recordVOs[0]);
		record.displayDt = record.displayDT;
		record.displayEndDt = record.displayEndDT;
		record.publicDt = record.publicDT;
		delete record.displayDT;
		delete record.displayEndDT;
		delete record.publicDT;
		return {
			...record,
			archiveId,
		};
	}

	public async delete(recordVOs: RecordVO[]): Promise<RecordResponse> {
		const data = recordVOs.map((recordVO) => ({
			RecordVO: new RecordVO(recordVO).getCleanVO(),
		}));

		const cache = this.getThumbnailCache();
		for (const record of recordVOs) {
			if (record.parentFolder_linkId) {
				cache.invalidateFolder(record.parentFolder_linkId);
			}
		}

		return await this.http.sendRequestPromise<RecordResponse>(
			'/record/delete',
			data,
			{ ResponseClass: RecordResponse },
		);
	}

	public async move(
		recordVOs: RecordVO[],
		destination: FolderVO,
	): Promise<RecordResponse> {
		const data = recordVOs.map((recordVO) => ({
			RecordVO: new RecordVO(recordVO).getCleanVO(),
			FolderDestVO: {
				folder_linkId: destination.folder_linkId,
			},
		}));

		if (destination.folder_linkId) {
			this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
		}

		return await this.http.sendRequestPromise<RecordResponse>(
			'/record/move',
			data,
			{
				ResponseClass: RecordResponse,
				useAuthorizationHeader: true,
			},
		);
	}

	public async copy(
		recordVOs: RecordVO[],
		destination: FolderVO,
	): Promise<RecordResponse> {
		const data = recordVOs.map((recordVO) => ({
			RecordVO: new RecordVO(recordVO).getCleanVO(),
			FolderDestVO: {
				folder_linkId: destination.folder_linkId,
			},
		}));

		if (destination.folder_linkId) {
			this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
		}

		return await this.http.sendRequestPromise<RecordResponse>(
			'/record/copy',
			data,
			{
				ResponseClass: RecordResponse,
				useAuthorizationHeader: true,
			},
		);
	}

	private getThumbnailCache(): ThumbnailCache {
		const storage = new StorageService();
		return new ThumbnailCache(storage);
	}
}

export class RecordResponse extends BaseResponse {
	public getRecordVO() {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return new RecordVO(data[0][0].RecordVO);
	}

	public getRecordVOs() {
		const data = this.getResultsData();

		return data.map((result) => new RecordVO(result[0].RecordVO));
	}
}
