import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PledgeComponent } from './components/pledge/pledge.component';


export const routes: Routes = [
  {
    path: '',
    component: PledgeComponent,
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
  ],
  declarations: [
    PledgeComponent
  ]
})
export class PledgeRoutingModule { }

