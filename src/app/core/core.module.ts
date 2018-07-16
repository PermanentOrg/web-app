import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { NavComponent } from './components/nav/nav.component';

import { CoreRoutingModule } from './core-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  declarations: [HomeComponent, MainComponent, NavComponent]
})
export class CoreModule { }
