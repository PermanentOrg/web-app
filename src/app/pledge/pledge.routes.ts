import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CountUpModule } from 'countup.js-angular2';

import { SharedModule } from '@shared/shared.module';

import { PledgeComponent } from './components/pledge/pledge.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { ClaimStorageComponent } from './components/claim-storage/claim-storage.component';
import { ClaimStorageLoginComponent } from './components/claim-storage-login/claim-storage-login.component';

export const routes: Routes = [
  {
    path: '',
    component: PledgeComponent,
    children: [
      {
        path: '',
        component: NewPledgeComponent
      },
      {
        path: 'claim',
        component: ClaimStorageComponent
      },
      {
        path: 'claimlogin',
        component: ClaimStorageLoginComponent
      }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    CountUpModule
  ],
  providers: [
  ],
  declarations: [
    PledgeComponent,
    PhaseProgressComponent,
    NewPledgeComponent,
    ClaimStorageComponent
  ]
})
export class PledgeRoutingModule { }

