import { NgModule } from '@angular/core';

import { AuthRoutingModule } from '@auth/auth.routes';
import { AuthComponent } from './components/auth/auth.component';

@NgModule({
  imports: [
    AuthRoutingModule
  ],
  declarations: []
})
export class AuthModule { }
