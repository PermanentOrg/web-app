import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharePreviewComponent } from './components/share-preview/share-preview.component';
import { SharePreviewRoutingModule } from './share-preview.routes';

@NgModule({
  declarations: [
  ],
  imports: [
    SharePreviewRoutingModule,
    CommonModule
  ]
})
export class SharePreviewModule { }
