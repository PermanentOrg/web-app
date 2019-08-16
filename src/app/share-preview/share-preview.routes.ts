import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharePreviewComponent } from './components/share-preview/share-preview.component';

export const routes: Routes = [
  {
    path: '',
    component: SharePreviewComponent
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  providers: [
  ]
})
export class SharePreviewRoutingModule { }

