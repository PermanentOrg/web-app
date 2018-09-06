import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { RecordVO } from '@root/app/models';

@Injectable()
export class RecordResolveService implements Resolve<any> {

  constructor(private api: ApiService, private dataService: DataService, private message: MessageService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    const localItem = this.dataService.getItemByArchiveNbr(route.params.recArchiveNbr);

    if (localItem) {
      return Promise.resolve(localItem);
    }

    return this.api.record.get([new RecordVO({archiveNbr: route.params.recArchiveNbr})])
      .then((response: RecordResponse) => {
        return response.getRecordVO();
      })
      .catch((response: RecordResponse) => {
        this.message.showError(response.getMessage(), true);
        return Promise.reject(response);
      });
  }
}
