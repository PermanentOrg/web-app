import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { Injectable } from '@angular/core';
import { ArchiveVO } from '@models/index';

@Injectable({
  providedIn: 'root',
})
export class PublicTagsResolveService implements Resolve<any> {
  constructor(private api: ApiService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const archiveNbr = route.params.publicArchiveNbr;
    const response = await this.api.archive.get([
      new ArchiveVO({ archiveNbr }),
    ]);
    const archiveId = response.getArchiveVO().archiveId;
    const res = await this.api.archive.getArchiveTags(archiveId);
    localStorage.setItem('tags', JSON.stringify(res));
  }
}
