import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';

import { ArchiveVO } from '@models';

@Injectable()
export class PublicProfileItemsResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
  ) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    const archiveNbr = route.params.publicArchiveNbr;
    const vo = new ArchiveVO({archiveNbr});
    const response = await this.api.archive.getAllProfileItems(vo);
    return response.getProfileItemVOs().filter(i => i.publicDT);
  }
}
