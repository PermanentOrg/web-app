import { BaseVOData } from './base-vo';

export interface PublishIaData extends BaseVOData {
	publish_iaId?: number;
	archiveId: number;
	accountId: number;
	folder_linkId: number;
	permalink?: string;
	identifier?: string;
}
