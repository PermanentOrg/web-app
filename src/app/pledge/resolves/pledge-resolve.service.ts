import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { PledgeService } from '@pledge/services/pledge.service';

@Injectable()
export class PledgeResolveService {
  constructor(private pledgeService: PledgeService) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<any> {
    if (!route.queryParams.pledgeId) {
      return Promise.resolve(null);
    }

    try {
      await this.pledgeService.loadPledge(route.queryParams.pledgeId);
    } catch (err) {
      return Promise.resolve(null);
    }
  }
}
