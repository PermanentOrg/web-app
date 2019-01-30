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
  declarations: [ClaimStorageLoginComponent]
})
export class PledgeModule { }
