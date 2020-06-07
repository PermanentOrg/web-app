import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { TagsService } from '@core/services/tags/tags.service';

@Injectable()
export class TagsResolveService implements Resolve<any> {

  constructor(private tags: TagsService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    return this.tags.refreshTags();
  }
}
