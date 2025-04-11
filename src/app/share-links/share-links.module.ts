import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ShareLinksApiService } from './services/share-links-api.service';

@NgModule({
  declarations: [],
  providers: [ShareLinksApiService],
  imports: [CommonModule, SharedModule],
})
export class ShareLinksModule {}
