import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {OnboardingComponent} from './components/onboarding/onboarding.component';
import { CreateNewArchiveComponent } from './components/create-new-archive/create-new-archive.component';
import { OnboardingAuthGuard } from './guards/onboarding.auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent,
    canActivate: [ OnboardingAuthGuard ],
    children: [
      {
        path: 'new-archive',
        component: CreateNewArchiveComponent,
        data: {
          onboardingScreen: 'newArchive',
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
