import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { SignupEmbedComponent } from '@embed/components/signup-embed/signup-embed.component';
import { DoneEmbedComponent } from '@embed/components/done-embed/done-embed.component';
import { VerifyEmbedComponent } from '@embed/components/verify-embed/verify-embed.component';

export const routes: Routes = [
  { path: 'signup', component: SignupEmbedComponent },
  { path: 'verify', component: VerifyEmbedComponent },
  { path: 'done', component: DoneEmbedComponent },
  { path: '**', redirectTo: 'signup'}
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    SignupEmbedComponent,
    DoneEmbedComponent,
    VerifyEmbedComponent
  ]
})
export class EmbedRoutingModule { }

