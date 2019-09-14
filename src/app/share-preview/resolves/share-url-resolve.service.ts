import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';

import { ArchiveResponse, ShareResponse } from '@shared/services/api/index.repo';
import { RecordVO, ArchiveVO, FolderVO } from '@models/index';

@Injectable()
export class ShareUrlResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
    private device: DeviceService
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    return this.api.share.checkShareLink(route.params.shareToken)
      .then((response: ShareResponse): any => {
        if (response.isSuccessful) {
          const shareByUrlVO = response.getShareByUrlVO();
          const shareVO = shareByUrlVO.ShareVO;

          if (!shareVO || shareVO.status.includes('pending')) {
            return shareByUrlVO;
          } else if (shareVO.status.includes('ok') && shareByUrlVO.RecordVO) {
            if (this.device.isMobile()) {
              return this.router.navigate(['/shares', 'withme']);
            } else {
              window.location.assign(`/app/shares/`);
            }
          } else if (shareVO.status.includes('ok')) {
            const folder: FolderVO = shareByUrlVO.FolderVO;
            if (this.device.isMobile()) {
              return this.router.navigate(['/shares', 'withme', folder.archiveNbr, folder.folder_linkId]);
            } else {
              window.location.assign(`/app/shares/${folder.archiveNbr}/${folder.folder_linkId}`);
            }
          }
        } else {
          throw response;
        }
      })
      .catch((response: ShareResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        return this.router.navigate(['share', 'error']);
      });
  }
}
