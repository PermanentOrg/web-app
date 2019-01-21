import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { PledgeRoutingModule } from './pledge.routes';
import { environment } from '@root/environments/environment';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    PledgeRoutingModule
  ],
  declarations: [
  ]
})
export class PledgeModule { }
