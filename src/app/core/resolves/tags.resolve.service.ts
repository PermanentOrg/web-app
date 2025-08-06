import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { TagsService } from '@core/services/tags/tags.service';

@Injectable()
export class TagsResolveService {
	constructor(private tags: TagsService) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		await this.tags.refreshTags();
	}
}
