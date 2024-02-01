import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { CountUpModule } from 'ngx-countup';
import { environment } from '@root/environments/environment';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { ComponentsModule } from '../component-library/components.module';
import { PledgeRoutingModule } from './pledge.routes';
import { NewPledgeComponent } from './components/new-pledge/new-pledge.component';
import { PledgeService } from './services/pledge.service';
import { ClaimStorageLoginComponent } from './components/claim-storage-login/claim-storage-login.component';
import { ClaimDoneComponent } from './components/claim-done/claim-done.component';
import { PledgeComponent } from './components/pledge/pledge.component';
import { PhaseProgressComponent } from './components/phase-progress/phase-progress.component';
import { ClaimStorageComponent } from './components/claim-storage/claim-storage.component';
import { PledgeListComponent } from './components/pledge-list/pledge-list.component';
import { MissingPledgeComponent } from './components/missing-pledge/missing-pledge.component';
import { UpdateCardComponent } from './components/update-card/update-card.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AngularFireModule.initializeApp({
      ...environment.firebase,
      apiKey: SecretsService.getStatic('FIREBASE_API_KEY'),
    }),
    AngularFireDatabaseModule,
    PledgeRoutingModule,
    CountUpModule,
    ComponentsModule,
  ],
  providers: [PledgeService],
  declarations: [
    PledgeComponent,
    PhaseProgressComponent,
    NewPledgeComponent,
    ClaimStorageComponent,
    ClaimStorageLoginComponent,
    ClaimDoneComponent,
    PledgeListComponent,
    MissingPledgeComponent,
    UpdateCardComponent,
  ],
  exports: [NewPledgeComponent],
})
export class PledgeModule {}
