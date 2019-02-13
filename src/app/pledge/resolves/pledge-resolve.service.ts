import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { PledgeService } from '@pledge/services/pledge.service';

@Injectable()
export class PledgeResolveService implements Resolve<any> {

  constructor(private pledgeService: PledgeService) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    if (!route.queryParams.pledgeId) {
      return Promise.resolve(null);
    }

    try {
      await this.pledgeService.loadPledge(route.queryParams.pledgeId);
    } catch (err) {
      console.error('PledgeResolve error', err);
      return Promise.resolve(null);
    }
  }
}
