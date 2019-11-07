import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class ArchivesResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    return this.accountService.refreshArchives();
  }
}
