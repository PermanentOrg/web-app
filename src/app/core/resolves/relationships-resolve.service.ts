import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RelationshipService } from '@core/services/relationship/relationship.service';

@Injectable()
export class RelationshipsResolveService {
	constructor(private relationshipService: RelationshipService) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		return this.relationshipService.get();
	}
}
