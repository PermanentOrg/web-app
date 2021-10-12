import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {OnboardingComponent} from './components/onboarding/onboarding.component';

export const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent,
  },
  {
    path: 'new-archive',
    component: OnboardingComponent,
    data: {
      onboardingScreen: 'newArchive',
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
