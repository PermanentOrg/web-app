import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';
import { EventService } from '@shared/services/event/event.service';
import { AccountService } from '@shared/services/account/account.service';
import { UploadItem } from './uploadItem';

const buildForm = (fields: object, file: File) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		formData.append(key, value as string);
	}
	formData.append(
		'Content-Type',
		file.type ? file.type : 'application/octet-stream',
	);
	formData.append('file', file);
	return formData;
};

@Injectable()
export class Uploader {
	protected readonly tenMB = 10 * 1024 * 1024;

	constructor(
		private api: ApiService,
		private httpClient: HttpClient,
		private event: EventService,
		private account: AccountService,
	) {}

	private getUploadData = async (item: UploadItem) => {
		const response = await this.api.record.getPresignedUrl(
			item.RecordVO,
			item.file.type ? item.file.type : 'application/octet-stream',
		);
		if (response.isSuccessful !== true) {
			throw response;
		}
		return response.getSimpleVO().value;
	};

	private registerRecord = async (item: UploadItem, destinationUrl: string) => {
		const archiveId = this.account.getArchive().archiveId;

		const record = await this.api.record.registerRecord(
			item.RecordVO,
			destinationUrl,
			archiveId,
		);

		this.event.dispatch({
			action: 'submit',
			entity: 'record',
			record,
		});
		return record;
	};

	private upload = async (
		item: UploadItem,
		emitUploadProgress: (e: HttpEvent<any>) => void,
	) => {
		const { destinationUrl, presignedPost } = await this.getUploadData(item);

		await this.httpClient
			.post(presignedPost.url, buildForm(presignedPost.fields, item.file), {
				observe: 'events',
				reportProgress: true,
				responseType: 'json',
				withCredentials: false,
			})
			.forEach(emitUploadProgress);

		return await this.registerRecord(item, destinationUrl);
	};

	private uploadToMultipartUrl = async (
		url: string,
		item: UploadItem,
		filePointer: number,
		eTags: string[],
	) => {
		const response = await this.httpClient
			.put(url, item.file.slice(filePointer, filePointer + this.tenMB), {
				headers: {
					'Content-Type': item.file.type || 'application/octet-stream',
				},
				observe: 'response',
				reportProgress: true,
				responseType: 'json',
				withCredentials: false,
			})
			.toPromise();
		const etag = response.headers.get('etag').replace(/^"(.+?)"$/, '$1');
		const index = Math.floor(filePointer / this.tenMB);
		eTags[index] = etag;
	};

	private uploadMultipart = async (
		item: UploadItem,
		emitProgress: (n: number) => void,
	) => {
		const archiveId = this.account.getArchive().archiveId;

		const size = item.file.size;
		const { urls, uploadId, key } =
			await this.api.record.getMultipartUploadURLs(size);
		let filePointer = 0;
		const eTags: string[] = [];
		for (const url of urls) {
			let uploaded = false;
			let retries = 0;
			const retryLimit = 10;
			while (!uploaded) {
				try {
					await this.uploadToMultipartUrl(url, item, filePointer, eTags);
					uploaded = true;
				} catch {
					retries += 1;
					if (retries > retryLimit) {
						throw new Error('Multipart upload retry limit exceeded');
					}
				}
			}
			filePointer += this.tenMB;
			const progress = Math.min(filePointer / size, 1);
			emitProgress(progress);
		}

		const record = await this.api.record.registerMultipartRecord(
			item.RecordVO,
			uploadId,
			key,
			eTags,
			archiveId,
		);

		this.event.dispatch({
			action: 'submit',
			entity: 'record',
			record,
		});

		return record;
	};

	async uploadFile(
		item: UploadItem,
		emitUploadProgress: (e: number) => void,
	): Promise<any> {
		const multiPartSize = 100 * 1024 * 1024; // 100 MB
		emitUploadProgress(0);

		const httpProgress = (e: HttpEvent<any>) => {
			if (e.type === HttpEventType.UploadProgress) {
				emitUploadProgress(e.loaded / e.total);
			}
		};

		if (item.file.size > multiPartSize) {
			await this.uploadMultipart(item, emitUploadProgress);
		} else {
			await this.upload(item, httpProgress);
		}

		emitUploadProgress(1);

		return await Promise.resolve();
	}
}
