import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveResponse } from '@shared/services/api/index.repo';
import { RecordVO, ArchiveVO } from '@models';

@Injectable()
export class PublicArchiveResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    const archiveNbr = route.params.publicArchiveNbr;
    return this.api.archive.getByArchiveNbr([archiveNbr])
      .then((response: ArchiveResponse): ArchiveVO => {
        return response.getArchiveVO();
      });
  }
}
