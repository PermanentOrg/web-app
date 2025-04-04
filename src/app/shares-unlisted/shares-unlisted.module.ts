import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { UnlistedSharesApiService } from './services/unlisted-shares-api.service';

@NgModule({
  declarations: [],
  providers: [UnlistedSharesApiService],
  imports: [CommonModule, SharedModule],
})
export class SharesUnlistedModule {}
