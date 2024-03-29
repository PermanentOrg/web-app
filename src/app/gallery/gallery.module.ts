/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';
import { PublicModule } from '@public/public.module';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { GalleryHeaderComponent } from './components/gallery-header/gallery-header.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { FeaturedArchiveComponent } from './components/featured-archive/featured-archive.component';
import { PublicArchivesListComponent } from './components/public-archives-list/public-archives-list.component';
import { ArchiveTypeNamePipe } from './pipes/archive-type-name.pipe';
import { FEATURED_ARCHIVE_API } from './types/featured-archive-api';
import { FeaturedArchiveService } from './services/featured-archive.service';

@NgModule({
  declarations: [
    GalleryComponent,
    GalleryHeaderComponent,
    FeaturedArchiveComponent,
    PublicArchivesListComponent,
    ArchiveTypeNamePipe,
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    PublicModule,
    SharedModule,
    FontAwesomeModule,
  ],
  providers: [
    AccountService,
    { provide: FEATURED_ARCHIVE_API, useClass: FeaturedArchiveService },
  ],
})
export class GalleryModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faSearch, faArrowRight);
  }
}
