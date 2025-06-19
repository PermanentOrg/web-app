import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveResponse } from '@shared/services/api/index.repo';
import { RecordVO, ArchiveVO } from '@models';

@Injectable()
export class PreviewArchiveResolveService {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const archiveId = route.parent.data.previewItem.archiveId;
    const archiveNbr = route.parent.data.previewItem.archiveArchiveNbr;
    return this.api.archive
      .get([new ArchiveVO({ archiveId, archiveNbr })])
      .then((response: ArchiveResponse): ArchiveVO => {
        return response.getArchiveVO();
      });
  }
}
