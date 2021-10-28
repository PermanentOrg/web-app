import { BaseVO, BaseVOData } from './base-vo';

export interface TagVOData extends BaseVOData {
  tagId?: number;
  name?: string;
  status?: string;
}

export interface TagLinkVOData extends BaseVOData {
  tag_linkId?: number;
  refTable?: 'record' | 'folder';
  refId?: number;
}

export class TagVO extends BaseVO implements TagVOData {
  public tagId: number;
  public name: string;

  constructor(data: TagVOData) {
    super(data);
  }
}
