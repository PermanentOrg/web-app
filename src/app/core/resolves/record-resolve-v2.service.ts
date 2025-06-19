import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { RecordResponse } from '@shared/services/api/index.repo';
import { RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

@Injectable()
export class RecordResolveV2Service {
  constructor(
    private api: ApiService,
    private dataService: DataService,
    private message: MessageService,
    private route: ActivatedRoute,
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<RecordVO> {
    const localItem = this.dataService.getItemByArchiveNbr(
      route.params.recArchiveNbr,
    );

    const itemId = route.queryParams.itemId;

    let token;

    this.route.queryParams.subscribe((t) => {
      token = t.token;
    });

    const headers = {
      'X-Permanent-Share-Token': token ? token : route.queryParams.token,
    };

    try {
      if (localItem && localItem.dataStatus === DataStatus.Full) {
        return Promise.resolve(localItem as RecordVO);
      } else if (localItem) {
        await this.dataService.fetchFullItems([localItem]);
        return localItem as RecordVO;
      } else {
        const response = await this.api.record.get(
          [
            new RecordVO({
              recordId: itemId,
            }),
          ],
          true,
          headers,
        );
        const record: any = response[0];
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
