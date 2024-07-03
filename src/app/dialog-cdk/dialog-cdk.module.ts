import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule as AngularCdkDialogModule } from '@angular/cdk/dialog';
import { SearchService } from '@search/services/search.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, AngularCdkDialogModule],
})
export class DialogCdkModule {}
