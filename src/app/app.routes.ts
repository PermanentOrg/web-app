import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes, Route } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface RouteData {
  title?: string;

  showSidebar?: boolean;
  showFolderViewToggle?: boolean;
  showFolderDescription?: boolean;

  checkFolderViewOnNavigate?: boolean;
  noFileListPadding?: boolean;
  fileListCentered?: boolean;
  isPublicArchive?: boolean;
}

export interface RouteWithData extends Route {
  data?: RouteData;
  children?: RoutesWithData;
}

export type RoutesWithData = RouteWithData[];

const routes: RoutesWithData = [
  {
    path: 'm',
    children: [
      { path: 'login', redirectTo: 'auth/login', pathMatch: 'full'  },
      { path: 'signup', redirectTo: 'auth/signup', pathMatch: 'full'  },
      { path: 'sharing', redirectTo: 'auth/signup', pathMatch: 'full'  },
      { path: 'mfa', redirectTo: 'auth/mfa', pathMatch: 'full'  },
      { path: 'verify', redirectTo: 'auth/verify', pathMatch: 'full'  },
      { path: 'forgot', redirectTo: 'auth/forgot', pathMatch: 'full'  },
      { path: 'reset', redirectTo: 'auth/reset', pathMatch: 'full'  },
      { path: 'terms', redirectTo: 'auth/terms', pathMatch: 'full'  },
      { path: 'signupEmbed', redirectTo: 'embed/signup', pathMatch: 'full'  },
      { path: 'verifyEmbed', redirectTo: 'embed/verify', pathMatch: 'full'  },
      { path: 'doneEmbed', redirectTo: 'embed/done', pathMatch: 'full'  },
      { path: 'auth', loadChildren: '@auth/auth.module#AuthModule' },
      { path: 'embed', loadChildren: '@embed/embed.module#EmbedModule' },
      { path: 'pledge', loadChildren: '@pledge/pledge.module#PledgeModule'},
      { path: '', loadChildren: '@core/core.module#CoreModule' },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  },
  { path: 'p', loadChildren: '@public/public.module#PublicModule',
    data: {
      title: 'Public'
    }
  },
  { path: 'share', loadChildren: '@share-preview/share-preview.module#SharePreviewModule',
    data: {
      title: 'Sharing'
    }
  },
  { path: '', redirectTo: 'm', pathMatch: 'full'},
  { path: 'app', redirectTo: 'm', pathMatch: 'full'},
  { path: ':path', redirectTo: 'm/:path'},
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {paramsInheritanceStrategy: 'always'}),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AppRoutingModule { }
