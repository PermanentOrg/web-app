import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PledgeComponent } from './components/pledge/pledge.component';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { ClaimStorageComponent } from './components/claim-storage/claim-storage.component';
import { ClaimStorageLoginComponent } from './components/claim-storage-login/claim-storage-login.component';
import { ClaimDoneComponent } from './components/claim-done/claim-done.component';

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
      },
      {
        path: 'done',
        component: ClaimDoneComponent
      }
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  providers: [
  ],
  declarations: [
  ]
})
export class PledgeRoutingModule { }

