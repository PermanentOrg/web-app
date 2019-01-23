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
  declarations: []
})
export class PledgeModule { }
