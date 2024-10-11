/* @format */
import { Component, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-archive-creation-with-share',
  templateUrl: './archive-creation-with-share.component.html',
  styleUrl: './archive-creation-with-share.component.scss',
})
export class ArchiveCreationWithShareComponent implements OnInit {
  public hasShareToken = false;
  public sharerName: string;
  public sharedItemName: string;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('shareToken');
    if (token) {
      this.api.invite.getFullShareInvite(token).then((invite) => {
        const inviteVO = invite.getInviteVO();
        console.log(inviteVO);
        this.sharerName = inviteVO.AccountVO.fullName;
        this.sharedItemName = inviteVO.RecordVO.displayName;
      });
    }
  }
}
