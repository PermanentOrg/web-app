import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiService } from '@shared/services/api/api.service';
import { RelationResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { RelationshipService } from '@core/services/relationship/relationship.service';

@Injectable()
export class RelationshipsResolveService implements Resolve<any> {

  constructor(private relationshipService: RelationshipService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    return this.relationshipService.get();
  }
}
