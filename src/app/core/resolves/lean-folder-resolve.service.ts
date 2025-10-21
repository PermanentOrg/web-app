import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { find, cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse } from '@shared/services/api/index.repo';

import { FolderVO } from '@root/app/models';

@Injectable()
export class LeanFolderResolveService {
	constructor(
		private api: ApiService,
		private accountService: AccountService,
		private message: MessageService,
		private router: Router,
	) {}

	resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<any> | Promise<any> {
		let targetFolder;

		if (route.params.archiveNbr && route.params.folderLinkId) {
			targetFolder = new FolderVO({
				archiveNbr: route.params.archiveNbr,
				folder_linkId: route.params.folderLinkId,
			});
		} else if (state.url === '/apps') {
			const apps = find(this.accountService.getRootFolder().ChildItemVOs, {
				type: 'type.folder.root.app',
			});
			targetFolder = new FolderVO(apps);
		} else if (state.url.includes('/share/')) {
			const sharedFolder = route.parent.data.sharePreviewVO.FolderVO;
			const sharedRecord = route.parent.data.sharePreviewVO.RecordVO;
			if (sharedFolder) {
				targetFolder = new FolderVO(sharedFolder);
			} else {
				const folder = new FolderVO(cloneDeep(route.parent.data.currentFolder));
				folder.pathAsArchiveNbr.unshift('0000-0000', '0000-0000');
				folder.pathAsText.unshift('Shares', 'Record');
				folder.pathAsFolder_linkId.unshift(0, 0);
				folder.ChildItemVOs = [sharedRecord];
				return Promise.resolve(folder);
			}
		} else {
			const myFiles = find(this.accountService.getRootFolder().ChildItemVOs, {
				type: 'type.folder.root.private',
			});
			targetFolder = new FolderVO(myFiles);
		}

		const leanFolderObservable = from(
			this.api.folder.navigateLean(targetFolder),
		);

		return leanFolderObservable
			.pipe(
				map((response: FolderResponse) => {
					if (!response.isSuccessful) {
						throw response;
					}

					return response.getFolderVO(true);
				}),
			)
			.toPromise()
			.catch(async (response: FolderResponse) => {
				this.message.showError({
					message: response.getMessage(),
					translate: true,
				});
				if (targetFolder.type.includes('root')) {
					this.accountService
						.logOut()
						.then(() => {
							this.router.navigate(['/login']);
						})
						.catch(() => {
							this.router.navigate(['/login']);
						});
				} else if (state.url.includes('apps')) {
					this.router.navigate(['/apps']);
				} else {
					this.router.navigate(['/private']);
				}
				return await Promise.reject(false);
			});
	}
}
