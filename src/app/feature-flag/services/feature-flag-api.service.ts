/* @format */
import { Injectable } from '@angular/core';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { firstValueFrom } from 'rxjs';
import { FeatureFlag } from '../types/feature-flag';
import { FeatureFlagApi } from '../types/feature-flag-api';

@Injectable({
	providedIn: 'root',
})
export class FeatureFlagApiService implements FeatureFlagApi {
	constructor(private http: HttpV2Service) {}

	public async getFeatureFlags(): Promise<FeatureFlag[]> {
		try {
			const response = await firstValueFrom(
				this.http.get<{ items: FeatureFlag[] }>(`/v2/feature-flags`, {}, null, {
					authToken: false,
				}),
			);
			return response[0].items;
		} catch {
			return [];
		}
	}
}
