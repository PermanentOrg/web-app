import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PledgeComponent } from './components/pledge/pledge.component';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { ClaimStorageComponent } from './components/claim-storage/claim-storage.component';
import { ClaimStorageLoginComponent } from './components/claim-storage-login/claim-storage-login.component';
import { ClaimDoneComponent } from './components/claim-done/claim-done.component';
import { PledgeListComponent } from './components/pledge-list/pledge-list.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { PledgeResolveService } from './resolves/pledge-resolve.service';
import { MissingPledgeComponent } from './components/missing-pledge/missing-pledge.component';
import { UpdateCardComponent } from './components/update-card/update-card.component';

export const routes: Routes = [
  {
    path: 'pledge',
    component: PledgeComponent,
    children: [
      {
        path: '',
        component: NewPledgeComponent
      },
      {
        path: 'claim',
        component: ClaimStorageComponent,
        resolve: {
          existingPledge: PledgeResolveService
        }
      },
      {
        path: 'claimlogin',
        component: ClaimStorageLoginComponent
      },
      {
        path: 'done',
        component: ClaimDoneComponent
      },
      {
        path: 'missing',
        component: MissingPledgeComponent
      }
    ]
  },
  {
    path: 'pledgeList',
    component: PledgeListComponent
  },
  {
    path: 'progress',
    component: PhaseProgressComponent
  },
  {
    path: 'update/:userId',
    component: UpdateCardComponent
  },
  {
    path: '',
    redirectTo: 'pledge'
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  providers: [
    PledgeResolveService
  ],
  declarations: [
  ]
})
export class PledgeRoutingModule { }

