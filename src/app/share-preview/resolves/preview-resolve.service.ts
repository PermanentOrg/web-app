import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { PublishResponse, FolderResponse } from '@shared/services/api/index.repo';
import { RecordVO, ShareByUrlVO, FolderVO } from '@models/index';

@Injectable()
export class PreviewResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    const shareByUrlVO = route.parent.data.shareByUrlVO as ShareByUrlVO;
    if (shareByUrlVO.FolderVO && shareByUrlVO.previewToggle) {
      return shareByUrlVO.FolderVO;
      // // if folder and share preview on, navigateMin like usual
      // return this.api.folder.navigate(shareByUrlVO.FolderVO as FolderVO).toPromise()
      //   .then((response: FolderResponse) => {
      //     console.log(response);
      //     return response.getFolderVO(true);
      //   });
    } else if (shareByUrlVO.FolderVO) {
      // if folder and share preview off, create the dummy folder with preview images
    } else {
      // if record, make dummy folder with just the record
    }


    return Promise.resolve();
    // return this.api.publish.getResource(route.params.shareToken)
    //   .then((response: PublishResponse): RecordVO | any => {
    //     if (response.getRecordVO()) {
    //       return response.getRecordVO();
    //     } else if (response.getFolderVO()) {
    //       return response.getFolderVO();
    //     } else {
    //       throw response;
    //     }
    //   })
    //   .catch((response: PublishResponse) => {
    //     if (response.getMessage) {
    //       this.message.showError(response.getMessage(), true);
    //     }
    //     return this.router.navigate(['p', 'error']);
    //   });
  }
}
