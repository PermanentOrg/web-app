import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';

import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { NavComponent } from './components/nav/nav.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileListItemComponent } from './components/file-list-item/file-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule
  ],
  declarations: [
    HomeComponent,
    MainComponent,
    NavComponent,
    LeftMenuComponent,
    FileListComponent,
    FileListItemComponent
  ]
})
export class CoreModule { }
