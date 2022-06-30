/* @format */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryComponent } from './components/gallery/gallery.component';
import { GalleryHeaderComponent } from './components/gallery-header/gallery-header.component';

import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';
import { PublicModule } from '@public/public.module';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FeaturedArchiveComponent } from './components/featured-archive/featured-archive.component';

@NgModule({
  declarations: [
    GalleryComponent,
    GalleryHeaderComponent,
    FeaturedArchiveComponent,
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    PublicModule,
    SharedModule,
    FontAwesomeModule,
  ],
  providers: [AccountService],
})
export class GalleryModule {
  constructor(private library: FaIconLibrary) {
    this.library.addIcons(faSearch, faArrowRight);
  }
}
