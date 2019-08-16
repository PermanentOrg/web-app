import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharePreviewComponent } from './components/share-preview/share-preview.component';
import { PreviewArchiveResolveService } from './resolves/preview-archive-resolve.service';
import { PreviewResolveService } from './resolves/preview-resolve.service';
import { SharedModule } from '@shared/shared.module';

const archiveResolve = {
  archive: PreviewArchiveResolveService
};

const previewResolve = {
  previewItem: PreviewResolveService
};


export const routes: Routes = [
  {
    path: ':shareToken',
    resolve: previewResolve,
    children: [
      {
        path: '',
        resolve: archiveResolve,
        component: SharePreviewComponent,
        loadChildren: '@embed/embed.module#EmbedModule'
      }
    ]
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule
  ],
  declarations: [
    SharePreviewComponent
  ],
  providers: [
    PreviewResolveService,
    PreviewArchiveResolveService
  ]
})
export class SharePreviewRoutingModule { }

