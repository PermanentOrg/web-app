import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { TagsService } from '@core/services/tags/tags.service';

@Injectable()
export class TagsResolveService implements Resolve<any> {

  constructor(private tags: TagsService) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    await this.tags.refreshTags();
  }
}
