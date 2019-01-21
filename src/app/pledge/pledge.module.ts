import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { PledgeRoutingModule } from './pledge.routes';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    PledgeRoutingModule
  ]
})
export class PledgeModule { }
