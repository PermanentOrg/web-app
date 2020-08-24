import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes, Route } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogComponentToken } from './dialog/dialog.module';
import { DialogOptions } from './dialog/dialog.service';

export interface RouteData {
  title?: string;

  showSidebar?: boolean;
  showFolderViewToggle?: boolean;
  showFolderDescription?: boolean;

  singleFile?: boolean;

  checkFolderViewOnNavigate?: boolean;
  noFileListPadding?: boolean;
  fileListCentered?: boolean;
  isPublicArchive?: boolean;

  dialogToken?: DialogComponentToken;
  dialogOptions?: DialogOptions;
}

export interface RouteWithData extends Route {
  data?: RouteData;
  children?: RoutesWithData;
}

export type RoutesWithData = RouteWithData[];

const routes: RoutesWithData = [
  {
    path: 'p', loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
    data: {
      title: 'Public'
    }
  },
  {
    path: 'share', loadChildren: () => import('./share-preview/share-preview.module').then(m => m.SharePreviewModule),
    data: {
      title: 'Sharing'
    }
  },
  {
    path: '',
    children: [
      { path: 'm/login', redirectTo: 'm/auth/login', pathMatch: 'full'  },
      { path: 'm/signup', redirectTo: 'm/auth/signup', pathMatch: 'full'  },
      { path: 'm/sharing', redirectTo: 'm/auth/signup', pathMatch: 'full'  },
      { path: 'm/mfa', redirectTo: 'm/auth/mfa', pathMatch: 'full'  },
      { path: 'm/verify', redirectTo: 'm/auth/verify', pathMatch: 'full'  },
      { path: 'm/forgot', redirectTo: 'm/auth/forgot', pathMatch: 'full'  },
      { path: 'm/reset', redirectTo: 'm/auth/reset', pathMatch: 'full'  },
      { path: 'm/terms', redirectTo: 'm/auth/terms', pathMatch: 'full'  },
      { path: 'm/signupEmbed', redirectTo: 'm/embed/signup', pathMatch: 'full'  },
      { path: 'm/verifyEmbed', redirectTo: 'm/embed/verify', pathMatch: 'full'  },
      { path: 'm/doneEmbed', redirectTo: 'm/embed/done', pathMatch: 'full'  },
      { path: 'm/auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
      { path: 'm/embed', loadChildren: () => import('./embed/embed.module').then(m => m.EmbedModule) },
      { path: 'm/pledge', loadChildren: () => import('./pledge/pledge.module').then(m => m.PledgeModule)},
      { path: '', loadChildren: () => import('./core/core.module').then(m => m.CoreModule) },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {paramsInheritanceStrategy: 'always', onSameUrlNavigation: 'reload'}),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AppRoutingModule { }
