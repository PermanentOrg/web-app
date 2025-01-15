/* @format */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LazyLoadFileBrowserSibling } from '@fileBrowser/lazy-load-file-browser-sibling';
import { RoutesWithData } from '../app.routes';
import { PublicComponent } from './components/public/public.component';
import { PublishResolveService } from './resolves/publish-resolve.service';
import { PublishArchiveResolveService } from './resolves/publish-archive-resolve.service';
import { ItemNotFoundComponent } from './components/item-not-found/item-not-found.component';
import { PublicArchiveComponent } from './components/public-archive/public-archive.component';
import { PublicArchiveResolveService } from './resolves/public-archive-resolve.service';
import { PublicRootResolveService } from './resolves/public-root-resolve.service';
import { PublicProfileItemsResolveService } from './resolves/public-profile-items-resolve.service';
import { PublicProfileComponent } from './components/public-profile/public-profile.component';
import { PublicSearchResultsComponent } from './components/public-search-results/public-search-results.component';
import { PublicTagsResolveService } from './resolves/public-tags-resolve.service';

const publicArchiveResolve = {
  archive: PublicArchiveResolveService,
  publicRoot: PublicRootResolveService,
  tags: PublicTagsResolveService,
  publicProfileItems: PublicProfileItemsResolveService,
};

const publishResolve = {
  publishedItem: PublishResolveService,
};

export const routes: RoutesWithData = [
  {
    path: '',
    component: PublicComponent,
    data: {
      isPublic: true,
    },
    children: [
      {
        path: 'error',
        component: ItemNotFoundComponent,
      },
      {
        path: 'archive/:publicArchiveNbr',
        resolve: publicArchiveResolve,
        component: PublicArchiveComponent,
        children: [
          {
            path: 'search/:archiveId/:query',
            component: PublicSearchResultsComponent,
          },
          {
            path: 'search-tag/:archiveId/:tagId',
            component: PublicSearchResultsComponent,
          },
          {
            path: 'profile',
            component: PublicProfileComponent,
          },
          {
            path: '',
            loadChildren: LazyLoadFileBrowserSibling,
            data: {
              noFileListPadding: true,
              isPublicArchive: true,
              checkFolderViewOnNavigate: true,
              showFolderDescription: true,
            },
          },
        ],
      },
      {
        path: ':publishUrlToken',
        resolve: publishResolve,
        children: [],
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [
    PublishResolveService,
    PublishArchiveResolveService,
    PublicArchiveResolveService,
    PublicRootResolveService,
    PublicProfileItemsResolveService,
    PublicTagsResolveService,
  ],
})
export class PublicRoutingModule {}
