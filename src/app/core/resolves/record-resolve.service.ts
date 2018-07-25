import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { RecordVO } from '@root/app/models';

@Injectable()
export class RecordResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    return this.api.record.get([new RecordVO({archiveNbr: route.params.recArchiveNbr})])
      .pipe(map(((response: RecordResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getRecordVO(true);
      }))).toPromise().catch((error) => {
        console.error(error);
      });
  }
}
