import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { ArchiveVO } from '@models';

@Injectable()
export class PublicArchiveResolveService {
	constructor(
		private api: ApiService,
		private publicProfile: PublicProfileService,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const archiveNbr = route.params.publicArchiveNbr;
		const response = await this.api.archive.get([
			new ArchiveVO({ archiveNbr }),
		]);
		this.publicProfile.setArchive(response.getArchiveVO());
	}
}
