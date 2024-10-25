/* @format */
import { InjectionToken } from '@angular/core';
import { FeatureFlag } from './feature-flag';

export interface FeatureFlagApi {
  getFeatureFlags(): Promise<FeatureFlag[]>;
}

export const FEATURE_FLAG_API = new InjectionToken<FeatureFlagApi>(
  'FeatureFlagApi',
);
