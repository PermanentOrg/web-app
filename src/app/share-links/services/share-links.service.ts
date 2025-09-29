import { Injectable } from '@angular/core';
import { ShareLinksApiService } from './share-links-api.service';
import { ShareLink } from '../models/share-link';

@Injectable({
	providedIn: 'root',
})
export class ShareLinksService {

	private _currentShareToken = '';
	private _shareLinks: ShareLink[] = undefined;

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
		if(!this._shareLinks) {
			this._shareLinks = await this.shareLinksApiService.getShareLinksByToken([this._currentShareToken]);
		}
		if(this._shareLinks && this._shareLinks.length) {
			return this._shareLinks[0].accessRestrictions === 'none';
		} else {
			return false;
		}
	}
}
