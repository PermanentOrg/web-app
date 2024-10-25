/* @format */
import { Inject, Injectable, Optional } from '@angular/core';
import { FEATURE_FLAG_API, FeatureFlagApi } from '../types/feature-flag-api';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  private flags = new Map<string, boolean>();

  constructor(
    @Optional() @Inject(FEATURE_FLAG_API) private api: FeatureFlagApi,
  ) {
    this.fetchFromApi();
  }

  public async fetchFromApi(): Promise<void> {
    try {
      const flags = await this.api.getFeatureFlags();
      flags.forEach((flag) => this.set(flag.name, flag.globallyEnabled));
    } catch {
      // Do nothing
    }
  }

  public set(flag: string, enabled: boolean): void {
    this.flags.set(flag, enabled);
  }

  public isEnabled(flag: string): boolean {
    return this.flags.has(flag) && this.flags.get(flag);
  }
}
