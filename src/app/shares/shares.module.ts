import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FileBrowserModule } from '@fileBrowser/file-browser.module';

import { AppsRoutingModule } from '@shares/shares.routes';
import { SharesComponent } from '@shares/components/shares/shares.component';
import { SharedModule } from '@shared/shared.module';
import { ShareComponent } from './components/share/share.component';
import { FileBrowserComponentsModule } from '@fileBrowser/file-browser-components.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    AppsRoutingModule,
    FileBrowserComponentsModule,
  ],
  declarations: [
    SharesComponent,
    ShareComponent,
  ],
  providers: [
  ]
})
export class SharesModule { }
