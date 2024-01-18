/* @format */
import { NgModule } from '@angular/core';
import { AuthRoutingModule } from '@auth/auth.routes';
import { CoreModule } from '@core/core.module';
@NgModule({
  imports: [AuthRoutingModule, CoreModule],
  declarations: [],
})
export class AuthModule {}
