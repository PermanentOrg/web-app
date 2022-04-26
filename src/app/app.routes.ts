import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes, Route } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogComponentToken } from './dialog/dialog.module';
import { DialogOptions } from './dialog/dialog.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderVO, RecordVO } from './models';

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
  isPublic?: boolean;

  dialogToken?: DialogComponentToken;
  dialogOptions?: DialogOptions;

  folderView?: FolderView;

  currentFolder?: FolderVO;
  currentRecord?: RecordVO;
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
      { path: 'app/login', redirectTo: 'app/auth/login', pathMatch: 'full'  },
      { path: 'app/signup', redirectTo: 'app/auth/signup', pathMatch: 'full'  },
      { path: 'app/sharing', redirectTo: 'app/auth/signup', pathMatch: 'full'  },
      { path: 'app/mfa', redirectTo: 'app/auth/mfa', pathMatch: 'full'  },
      { path: 'app/verify', redirectTo: 'app/auth/verify', pathMatch: 'full'  },
      { path: 'app/forgot', redirectTo: 'app/auth/forgot', pathMatch: 'full'  },
      { path: 'app/reset', redirectTo: 'app/auth/reset', pathMatch: 'full'  },
      { path: 'app/terms', redirectTo: 'app/auth/terms', pathMatch: 'full'  },
      { path: 'app/signupEmbed', redirectTo: 'app/embed/signup', pathMatch: 'full'  },
      { path: 'app/verifyEmbed', redirectTo: 'app/embed/verify', pathMatch: 'full'  },
      { path: 'app/doneEmbed', redirectTo: 'app/embed/done', pathMatch: 'full'  },
      { path: 'app/auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
      { path: 'app/embed', loadChildren: () => import('./embed/embed.module').then(m => m.EmbedModule) },
      { path: 'app/onboarding', loadChildren: () => import ('./onboarding/onboarding.module').then(m => m.OnboardingModule)},
      { path: 'app/pledge', loadChildren: () => import('./pledge/pledge.module').then(m => m.PledgeModule)},
      { path: 'm/embed', redirectTo: 'app/embed'},
      { path: 'm/pledge', redirectTo: 'app/pledge'},
      { path: '', loadChildren: () => import('./core/core.module').then(m => m.CoreModule) },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  },
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always', onSameUrlNavigation: 'reload' }),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AppRoutingModule { }
