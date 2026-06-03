import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ShareLink } from '../models/share-link';
import { ShareLinksApiService } from './share-links-api.service';

@Injectable({
	providedIn: 'root',
})
export class ShareLinksService {
	private _currentShareToken = '';
	private _shareLinks: ShareLink[] = undefined;

	constructor(
		private shareLinksApiService: ShareLinksApiService,
		private router: Router,
	) {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: NavigationEnd) => {
				if (!event.urlAfterRedirects.startsWith('/share/')) {
					this._currentShareToken = '';
					this._shareLinks = undefined;
				}
			});
	}

	public get currentShareToken() {
		return this._currentShareToken;
	}

	public set currentShareToken(token: string) {
		if (this._currentShareToken !== token) {
			this._shareLinks = undefined;
		}
		this._currentShareToken = token;
	}

	public async primeForToken(token: string): Promise<void> {
		this.currentShareToken = token;
		if (!token) {
			this._shareLinks = [];
			return;
		}
		try {
			this._shareLinks = await this.shareLinksApiService.getShareLinksByToken([
				token,
			]);
		} catch {
			this._shareLinks = [];
		}
	}

	public isUnlistedShareSync(): boolean {
		if (!this._currentShareToken || !this._shareLinks?.length) {
			return false;
		}
		return this._shareLinks[0].accessRestrictions === 'none';
	}

	public async isUnlistedShare() {
		if (!this._currentShareToken) {
			return false;
		}
		if (!this._shareLinks) {
			this._shareLinks = await this.shareLinksApiService.getShareLinksByToken([
				this._currentShareToken,
			]);
		}
		if (this._shareLinks && this._shareLinks.length) {
			return this._shareLinks[0].accessRestrictions === 'none';
		} else {
			return false;
		}
	}
}
