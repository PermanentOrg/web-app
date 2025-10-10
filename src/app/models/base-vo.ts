import { RecordVOData } from '@models/record-vo';
import { FolderVOData } from '@models/folder-vo';

export class BaseVO {
	public dataWhitelist: string[];
	public cleanParams = [];

	public status: string;

	public createdDT: string;
	public updatedDT: string;

	constructor(voData: any) {
		if (voData) {
			for (const key in voData) {
				if (voData[key] !== undefined && typeof voData[key] !== 'function') {
					this[key] = voData[key];
				}
			}
		}

		// this.createdDT = formatDateISOString(this.createdDT);
		// this.updatedDT = formatDateISOString(this.updatedDT);
	}

	public update(voData: any | RecordVOData | FolderVOData) {
		if (voData) {
			for (const key in voData) {
				if (voData[key] !== undefined) {
					this[key] = voData[key];
				}
			}
		}
	}

	public getCleanVO() {
		if (this.cleanParams.length) {
			const clean = {};
			this.cleanParams.forEach((param) => {
				clean[param] = this[param];
			});

			return clean;
		} else {
			return this;
		}
	}

	toJSON() {
		const clone: any = {};
		for (const key in this) {
			if (this[key] !== undefined) {
				clone[key] = this[key];
			}
		}

		delete clone.cleanParams;
		delete clone.isRecord;
		delete clone.isFolder;
		delete clone.isFetching;
		delete clone.isNewlyCreated;
		delete clone.fetched;
		delete clone.isPendingAction;
		delete clone.dataStatus;
		delete clone.ShareArchiveVO;
		return clone;
	}
}

export interface BaseVOData {
	createdDT?: string;
	updatedDT?: string;
}

export interface DynamicListChild {
	isPendingAction?: boolean;
	isNewlyCreated?: boolean;
}
