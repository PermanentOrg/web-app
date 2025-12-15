import { HttpService } from '@shared/services/http/http.service';
import { SimpleVO, ResponseMessageType } from '@root/app/models';
import { compact } from 'lodash';
import { Injectable } from '@angular/core';
import { HttpV2Service } from '../http-v2/http-v2.service';

export interface CSRFResponse {
	csrf: string;
}

export class BaseResponse {
	public isSuccessful: boolean;
	public isSystemUp: boolean;
	public Results: any[];
	public csrf: string;

	constructor(response?: any) {
		if (!response) {
			return;
		}

		this.isSuccessful = response.isSuccessful;
		this.isSystemUp = response.isSystemUp;
		this.Results = response.Results;

		this.csrf = response.csrf;
	}

	public getMessage() {
		if (!this.Results.length) {
			return '';
		}

		return this.Results[0].message[0] as ResponseMessageType;
	}

	public getResults(): any[] {
		return this.Results;
	}

	public getResultsData(): any[] {
		return compact(this.Results.map((result) => result.data));
	}

	public getSimpleVO(): SimpleVO {
		return new SimpleVO(this.getResultsData()[0][0].SimpleVO);
	}

	public messageIncludes(exact: string): boolean {
		return this.Results[0].message.indexOf(exact) > -1;
	}

	public messageIncludesPhrase(phrase: string): boolean {
		for (const messageItem of this.Results[0].message) {
			if (messageItem.includes(phrase)) {
				return true;
			}
		}
		return false;
	}

	public setData(data: any[]) {
		if (!this.Results) {
			this.Results = [{}];
		}

		this.Results[0].data = data;
	}

	public setMessage(message: string[]) {
		if (!this.Results) {
			this.Results = [{}];
		}

		this.Results[0].message = message;
	}
}

@Injectable()
export class BaseRepo {
	constructor(
		public http: HttpService,
		public httpV2?: HttpV2Service,
	) {}
}

export const LeanWhitelist = [
	'displayName',
	'accessRole',
	'description',
	'displayDT',
	'displayEndDT',
	'status',
	'archiveNbr',
	'timeZoneId',
	'locnId',
	'thumbStatus',
	'type',
	'updatedDT',
	'imageRatio',
	'viewProperty',
	'publicDT',
	'createdDT',
	'thumbURL200',
	'thumbURL500',
	'thumbURL1000',
	'thumbURL2000',
	'thumbDT',
	'refArchiveNbr',
	'folder_linkId',
	'recordId',
	'folderId',
	'position',
	'folder_linkType',
	'stdAbbrev',
	'stdOffset',
	'dstAbbrev',
	'dstOffset',
];
