import {
	InviteVO,
	RecordVO,
	FolderVO,
	AccountVO,
	ArchiveVO,
	ItemVO,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { firstValueFrom } from 'rxjs';

export class InviteRepo extends BaseRepo {
	public async send(invite: InviteVO, archive: ArchiveVO): Promise<any> {
		const data = {
			email: invite.email,
			fullName: invite.fullName,
			relationship: invite.relationship,
			byArchiveId: archive.archiveId,
		};

		return await firstValueFrom(
			this.httpV2.post('/invite/inviteSend', data, null),
		);
	}

	public async sendMemberInvite(member: AccountVO, archive: ArchiveVO) {
		const data = {
			accessRole: member.accessRole,
			byArchiveId: archive.archiveId,
			email: member.primaryEmail,
			fullName: member.fullName,
			type: 'type.invite.archive',
		};

		return await firstValueFrom(
			this.httpV2.post('/invite/byEmailAddress', data, null),
		);
	}

	public async sendShareInvite(invite: InviteVO, itemToShare: ItemVO) {
		const data: {
			email: string;
			byArchiveId: number;
			fullName: string;
			accessRole: string;
			folderLinkId: number;
			relationship: string;
			recordId?: number;
			folderId?: number;
		} = {
			email: invite.email,
			byArchiveId: invite.byArchiveId,
			fullName: invite.fullName,
			accessRole: invite.accessRole,
			folderLinkId: itemToShare.folder_linkId,
			relationship: invite.relationship,
		};

		if (itemToShare instanceof RecordVO && itemToShare.isRecord) {
			data.recordId = itemToShare.recordId;
		} else if (itemToShare instanceof FolderVO && itemToShare.isFolder) {
			data.folderId = itemToShare.folderId;
		}

		return await firstValueFrom(this.httpV2.post('/invite/share', data, null));
	}

	public async getShareInviteInfo(
		inviteEmail: string,
		inviteCode: string,
		shareItemId: number,
		shareItemType: 'r' | 'f',
	) {
		const data = [
			{
				primaryEmail: inviteEmail,
				inviteCode,
				shid: shareItemId,
				tp: shareItemType,
			},
		];

		return await this.http.sendRequestPromise<InviteResponse>(
			'/invite/getShareInviteInfo',
			data,
			{ ResponseClass: InviteResponse },
		);
	}

	public async getFullShareInvite(token: string) {
		const data = [
			{
				token,
			},
		];

		return await this.http.sendRequestPromise<InviteResponse>(
			'/invite/getFullShareInvite',
			data,
			{ ResponseClass: InviteResponse },
		);
	}

	public async getInvites() {
		return await this.http.sendRequestPromise<InviteResponse>(
			'/invite/getMyInvites',
			[{}],
			{ ResponseClass: InviteResponse },
		);
	}

	public async resendInvites(invites: InviteVO[]) {
		const data = invites.map((invite) => ({
			InviteVO: invite,
		}));

		return await this.http.sendRequestPromise<InviteResponse>(
			'/invite/inviteResend',
			data,
			{ ResponseClass: InviteResponse },
		);
	}
}

export class InviteResponse extends BaseResponse {
	public getInviteVO() {
		const data = this.getResultsData();
		if (!data || !data.length) {
			return null;
		}

		return new InviteVO(data[0][0].InviteVO);
	}

	public getInviteVOs() {
		const data = this.getResultsData();
		const invites = data.map((result) =>
			result.map((resultList) => resultList.InviteVO),
		);

		return flatten(invites);
	}
}
