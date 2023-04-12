import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';

@Injectable()
export class PublicRootResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private router: Router,
    private publicProfile: PublicProfileService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    const archiveNbr = route.params.publicArchiveNbr;
    try {
      const response = await this.api.folder.getPublicRoot(archiveNbr);
      console.log(response)
      const publicRoot = response.getFolderVO();
      this.publicProfile.setPublicRoot(response.getFolderVO());
      return publicRoot;
    } catch (err) {
      return this.router.navigate(['/p', 'error']);
    }
  }
}
