import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PledgeComponent } from './components/pledge/pledge.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { CommonModule } from '@angular/common';


export const routes: Routes = [
  {
    path: '',
    component: PledgeComponent,
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  providers: [
  ],
  declarations: [
    PledgeComponent,
    PhaseProgressComponent
  ]
})
export class PledgeRoutingModule { }

