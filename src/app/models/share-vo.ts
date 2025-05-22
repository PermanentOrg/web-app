import { orderBy } from 'lodash';

import { BaseVO, DynamicListChild } from '@models/base-vo';
import { ArchiveVO } from './archive-vo';
import { FolderVO } from './folder-vo';
import { RecordVO } from './record-vo';
import { AccessRoleType, getAccessAsEnum } from './access-role';

export function sortShareVOs(shares: ShareVO[]) {
	return orderBy(
		shares,
		[
			(share) => (share.status?.includes('pending') ? true : false),
			(share) => getAccessAsEnum(share.accessRole),
			(share) => (share.ArchiveVO.fullName as string).toLowerCase(),
		],
		['desc', 'desc', 'asc'],
	);
}

export type ShareStatus =
	| 'status.generic.ok'
	| 'status.generic.deleted'
	| 'status.generic.pending';

export class ShareVO extends BaseVO implements DynamicListChild {
	public shareId;
	public folder_linkId;
	public archiveId;
	public accessRole: AccessRoleType;
	public type;
	public status: ShareStatus;
	public requestToken: string;

	public isPendingAction = false;
	public isNewlyCreated = false;

	public FolderVO: FolderVO;
	public RecordVO: RecordVO;
	public ItemVO;
	public FolderLinkVO;
	public ArchiveVO: ArchiveVO;

	constructor(voData: any) {
		super(voData);

		if (this.ArchiveVO) {
			this.ArchiveVO = new ArchiveVO(this.ArchiveVO);
		}

		if (this.FolderVO) {
			this.FolderVO = new FolderVO(this.FolderVO);
		}

		if (this.RecordVO) {
			this.RecordVO = new RecordVO(this.RecordVO);
		}
	}
}
