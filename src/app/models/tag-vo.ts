import { BaseVOData } from './base-vo';

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
