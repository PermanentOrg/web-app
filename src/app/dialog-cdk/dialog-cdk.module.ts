import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule as AngularCdkDialogModule } from '@angular/cdk/dialog';
import { SearchService } from '@search/services/search.service';
import { RouterModule } from '@angular/router';
import { CoreRoutingModule } from '@core/core.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AngularCdkDialogModule,
    RouterModule,
    CoreRoutingModule,
  ],
})
export class DialogCdkModule {}
