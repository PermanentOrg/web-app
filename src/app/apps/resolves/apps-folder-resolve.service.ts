import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { find } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';
import { FilesystemService } from '@root/app/filesystem/filesystem.service';

import { FolderVO } from '@root/app/models';

@Injectable()
export class AppsFolderResolveService {
	constructor(
		private accountService: AccountService,
		private filesystemService: FilesystemService,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		const appsFolder = find(this.accountService.getRootFolder().ChildItemVOs, {
			type: 'type.folder.root.app',
		});

		return await this.filesystemService.getFolder(new FolderVO(appsFolder));
	}
}
