import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './components/test/test.component';
import { PublicRoutingModule } from './public.routes';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TestComponent],
  imports: [
    CommonModule,
    RouterModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
