import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestComponent } from './components/test/test.component';

export const routes: Routes = [
  {
    path: '',
    component: TestComponent,
    children: [
      { path: 'test', component: TestComponent },
      {
        path: ':archiveNbr/:folderLinkId',
        loadChildren: '@fileBrowser/file-browser.module#FileBrowserModule',
      }
    ]
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
  ]
})
export class PublicRoutingModule { }

