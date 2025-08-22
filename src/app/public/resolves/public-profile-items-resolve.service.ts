import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';

import { ArchiveVO } from '@models';

@Injectable()
export class PublicProfileItemsResolveService {
	constructor(
		private api: ApiService,
		private publicProfile: PublicProfileService,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const archiveNbr = route.params.publicArchiveNbr;
		const vo = new ArchiveVO({ archiveNbr });
		const response = await this.api.archive.getAllProfileItems(vo);
		const publicItems = response.getProfileItemVOs().filter((i) => i.publicDT);
		this.publicProfile.setProfileItems(publicItems);
	}
}
