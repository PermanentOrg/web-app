import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from '@core/core.routes';

import { SharedModule } from '@shared/shared.module';

import { DataService } from '@shared/services/data/data.service';
import { UploadService } from '@core/services/upload/upload.service';
import { PromptService } from '@core/services/prompt/prompt.service';

import { HomeComponent } from '@core/components/home/home.component';
import { MainComponent } from '@core/components/main/main.component';
import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { BreadcrumbsComponent } from '@core/components/breadcrumbs/breadcrumbs.component';
import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { EditPromptComponent } from './components/edit-prompt/edit-prompt.component';
import { ItemActionsMenuComponent } from '@core/components/item-actions-menu/item-actions-menu.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CoreRoutingModule,
  ],
  declarations: [
    HomeComponent,
    MainComponent,
    NavComponent,
    LeftMenuComponent,
    RightMenuComponent,
    BreadcrumbsComponent,
    UploadProgressComponent,
    UploadButtonComponent,
    EditPromptComponent,
    ItemActionsMenuComponent
  ],
  providers: [
    DataService,
    UploadService,
    PromptService
  ]
})
export class CoreModule { }
