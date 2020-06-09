import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';

import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderVO } from '@models';

@Injectable()
export class PublicRootResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    const archiveNbr = route.params.publicArchiveNbr;
    return this.api.folder.getPublicRoot(archiveNbr)
      .then((response: FolderResponse): FolderVO => {
        return response.getFolderVO();
      }).catch((response: any) => {
        if (response instanceof FolderResponse) {
          return this.router.navigate(['/p', 'error']);
        }
      });
  }
}
