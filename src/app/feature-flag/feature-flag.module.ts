/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FEATURE_FLAG_API } from './types/feature-flag-api';
import { FeatureFlagApiService } from './services/feature-flag-api.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [{ provide: FEATURE_FLAG_API, useClass: FeatureFlagApiService }],
})
export class FeatureFlagModule {}
