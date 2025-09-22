import { Injectable } from '@angular/core';
import { ShareLinksApiService } from './share-links-api.service';

@Injectable({
	providedIn: 'root',
})
export class ShareLinksService {

	private _currentShareToken = '';

	constructor(
			private shareLinksApiService: ShareLinksApiService) {
				
			}

	public get currentShareToken() {
		return this._currentShareToken;
	}

	public set currentShareToken(token: string) {
		this._currentShareToken = token;
	}

	public async isUnlistedShare() {
		if(!this._currentShareToken) {
			return false;
		}
		const shareLinks = await this.shareLinksApiService.getShareLinksByToken([this._currentShareToken]);
		if(shareLinks && shareLinks.length) {
			return shareLinks[0].accessRestrictions === 'none';
		} else {
			return false;
		}
	}
}
