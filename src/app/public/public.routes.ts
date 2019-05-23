import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestComponent } from './components/test/test.component';

export const routes: Routes = [
  {
    path: '',
    component: TestComponent,
  },
  { path: 'test', component: TestComponent }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
  ]
})
export class PublicRoutingModule { }

