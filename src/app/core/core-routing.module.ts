import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { MainComponent } from './components/main/main.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',
    component: MainComponent,
    canActivate: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
    children: [
      { path: '', component: HomeComponent},
      { path: '**', redirectTo: ''}
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class CoreRoutingModule { }

