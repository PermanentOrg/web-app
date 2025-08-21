import { Component, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';

@Component({
	selector: 'pr-archive-creation-with-share',
	templateUrl: './archive-creation-with-share.component.html',
	styleUrl: './archive-creation-with-share.component.scss',
	standalone: false,
})
export class ArchiveCreationWithShareComponent implements OnInit {
	public hasShareToken = false;
	public sharerName: string;
	public sharedItemName: string;
	public isFolder: boolean = false;

	constructor(private api: ApiService) {}

	ngOnInit(): void {
		const token = localStorage.getItem('shareToken');
		const copyToken = localStorage.getItem('shareTokenFromCopy');
		if (token) {
			this.api.invite.getFullShareInvite(token).then((invite) => {
				const inviteVO = invite.getInviteVO();
				this.sharerName = inviteVO.AccountVO.fullName;
				this.sharedItemName = inviteVO.RecordVO
					? inviteVO.RecordVO.displayName
					: inviteVO.FolderVO.displayName;
				this.isFolder = !inviteVO.RecordVO;
			});
		} else if (copyToken) {
			this.api.share.checkShareLink(copyToken).then((invite) => {
				const inviteVO = invite.Results[0].data[0].Shareby_urlVO;
				this.sharerName = inviteVO.AccountVO.fullName;
				this.sharedItemName = inviteVO.RecordVO
					? inviteVO.RecordVO.displayName
					: inviteVO.FolderVO.displayName;
			});
		}
	}
}
