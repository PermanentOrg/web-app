import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { find } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { RootFolderService } from '@shared/services/root-folder/root-folder.service';
import { ArchiveVO } from '@models';

@Injectable()
export class RootFolderResolveService {
	constructor(
		private accountService: AccountService,
		private messageService: MessageService,
		private rootFolderService: RootFolderService,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		// check for targetArchiveNbr parameter and switch archives if possible
		const targetArchiveNbr = route.queryParams.targetArchiveNbr;

		if (
			targetArchiveNbr &&
			this.accountService.getArchive().archiveNbr !== targetArchiveNbr
		) {
			const archives = await this.accountService.refreshArchives();
			const targetArchive = find(archives, {
				archiveNbr: targetArchiveNbr,
			}) as ArchiveVO;
			if (targetArchive) {
				await this.accountService.changeArchive(targetArchive);
			} else {
				this.messageService.showMessage({
					message: `The current account does not have access to the specified archive. Switch accounts to perform this action.`,
					style: 'info',
				});
			}
		}

		const currentRoot = this.accountService.getRootFolder();

		if (currentRoot) {
			return currentRoot;
		}

		const root = await this.rootFolderService.loadRootFolder(
			this.accountService.getArchive(),
		);
		this.accountService.setRootFolder(root);
		return root;
	}
}
