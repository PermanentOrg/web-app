import { BaseVO, BaseVOData } from './base-vo';

export interface TagVOData extends BaseVOData {
	tagId?: number;
	name?: string;
	status?: string;
	type?: string;
	archiveId?: number;
}

export interface TagLinkVOData extends BaseVOData {
	tag_linkId?: number;
	refTable?: 'record' | 'folder';
	refId?: number;
}

export class TagVO extends BaseVO implements TagVOData {
	public tagId: number;
	public name: string;
	public archiveId: number;
	public type: string;

	constructor(data: TagVOData) {
		super(data);
	}

	public isCustomMetadata(): boolean {
		return this.type?.includes('type.tag.metadata');
	}
}
