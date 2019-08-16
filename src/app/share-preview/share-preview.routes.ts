import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharePreviewComponent } from './components/share-preview/share-preview.component';
import { EmbedComponentsModule } from '@embed/embed-components.module';
import { SignupEmbedComponent } from '@embed/components/signup-embed/signup-embed.component';
import { LoginEmbedComponent } from '@embed/components/login-embed/login-embed.component';

export const routes: Routes = [
  {
    path: '',
    component: SharePreviewComponent,
    children: [
      {
        path: 'login',
        component: LoginEmbedComponent
      },
      {
        path: 'signup',
        component: SignupEmbedComponent
      }
    ]
  },

];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
    EmbedComponentsModule
  ],
  declarations: [
    SharePreviewComponent
  ],
  providers: [
  ]
})
export class SharePreviewRoutingModule { }

