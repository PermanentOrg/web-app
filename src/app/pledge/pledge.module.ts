import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { CountUpModule } from 'countup.js-angular2';
import { PledgeRoutingModule } from './pledge.routes';
import { environment } from '@root/environments/environment';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { PledgeService } from './services/pledge.service';
import { ClaimStorageLoginComponent } from './components/claim-storage-login/claim-storage-login.component';
import { ClaimDoneComponent } from './components/claim-done/claim-done.component';
import { PledgeComponent } from './components/pledge/pledge.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { ClaimStorageComponent } from './components/claim-storage/claim-storage.component';
import { PledgeListComponent } from './components/pledge-list/pledge-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    PledgeRoutingModule,
    CountUpModule
  ],
  providers: [
    PledgeService
  ],
  declarations: [
    PledgeComponent,
    PhaseProgressComponent,
    NewPledgeComponent,
    ClaimStorageComponent,
    ClaimStorageLoginComponent,
    ClaimDoneComponent,
    PledgeListComponent
  ]
})
export class PledgeModule { }
