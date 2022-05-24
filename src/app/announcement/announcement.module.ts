import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementComponent } from './components/announcement/announcement.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faWindowClose } from '@fortawesome/free-solid-svg-icons';


@NgModule({
  declarations: [AnnouncementComponent],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    AnnouncementComponent,
  ]
})
export class AnnouncementModule {
  constructor(
    private library: FaIconLibrary,
  ) {
    library.addIcons(faWindowClose);
  }
}
