import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { NavComponent } from './components/nav/nav.component';

import { CoreRoutingModule } from './core-routing.module';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  declarations: [HomeComponent, MainComponent, NavComponent, LeftMenuComponent]
})
export class CoreModule { }
