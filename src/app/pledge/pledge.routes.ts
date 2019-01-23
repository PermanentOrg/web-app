import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PledgeComponent } from './components/pledge/pledge.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { CommonModule } from '@angular/common';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { SharedModule } from '@shared/shared.module';
import { CountUpModule } from 'countup.js-angular2';


export const routes: Routes = [
  {
    path: '',
    component: PledgeComponent,
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
    NewPledgeComponent
  ]
})
export class PledgeRoutingModule { }

