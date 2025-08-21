import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';

@Injectable()
export class PublicRootResolveService {
	constructor(
		private api: ApiService,
		private router: Router,
		private publicProfile: PublicProfileService,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const archiveNbr = route.params.publicArchiveNbr;
		try {
			const response = await this.api.folder.getPublicRoot(archiveNbr);
			const publicRoot = response.getFolderVO();
			this.publicProfile.setPublicRoot(response.getFolderVO());
			return publicRoot;
		} catch (err) {
			return await this.router.navigate(['/p', 'error']);
		}
	}
}
