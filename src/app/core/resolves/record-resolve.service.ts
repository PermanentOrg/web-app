import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import {
  FolderResponse,
  RecordResponse,
} from '@shared/services/api/index.repo';
import { RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

@Injectable()
export class RecordResolveService {
  constructor(
    private api: ApiService,
    private dataService: DataService,
    private message: MessageService,
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<RecordVO> {
    const localItem = this.dataService.getItemByArchiveNbr(
      route.params.recArchiveNbr,
    );

    try {
      if (localItem && localItem.dataStatus === DataStatus.Full) {
        return Promise.resolve(localItem as RecordVO);
      } else if (localItem) {
        await this.dataService.fetchFullItems([localItem]);
        return localItem as RecordVO;
      } else {
        const response = await this.api.record.get([
          new RecordVO({ archiveNbr: route.params.recArchiveNbr }),
        ]);
        const record = (response as RecordResponse).getRecordVO();
        record.dataStatus = DataStatus.Full;
        return record;
      }
    } catch (err) {
      if (err instanceof RecordResponse) {
        this.message.showError({ message: err.getMessage(), translate: true });
      }
      throw err;
    }
  }
}
