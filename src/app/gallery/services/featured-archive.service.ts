import { Injectable } from '@angular/core';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { FeaturedArchiveApi } from '../types/featured-archive-api';
import { FeaturedArchive } from '../types/featured-archive';

@Injectable({
	providedIn: 'root',
})
export class FeaturedArchiveService implements FeaturedArchiveApi {
	constructor(private http: HttpV2Service) {}

	public async getFeaturedArchiveList() {
		return this.http.get<FeaturedArchive>('/v2/archive/featured').toPromise();
	}
}
